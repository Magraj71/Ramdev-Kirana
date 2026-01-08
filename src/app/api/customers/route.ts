import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest, isOwner } from '@/lib/auth';
import mongoose from 'mongoose';

// GET all customers (users with role = 'user')
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Check authentication
    try {
      const user = getUserFromRequest(request);
      
      // Optional: Only owners can view all customers
      if (user.role !== 'owner') {
        return NextResponse.json(
          { success: false, message: 'Only store owners can view customers' },
          { status: 403 }
        );
      }
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const customerType = searchParams.get('type') || '';

    // Build query - get only users with role 'user'
    const query: any = { role: 'user' };

    // Search in name, phone, email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { storeName: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status) {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
    }

    // Filter by customer/store type
    if (customerType) {
      query.storeType = customerType;
    }

    // Select only required fields (exclude password and sensitive data)
    const projection = {
      name: 1,
      email: 1,
      phone: 1,
      address: 1,
      storeName: 1,
      storeType: 1,
      gstNumber: 1,
      totalOrders: 1,
      totalSpent: 1,
      loyaltyPoints: 1,
      role: 1,
      isActive: 1,
      createdAt: 1,
      updatedAt: 1,
      preferences: 1,
      avatar: 1,
    };

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get customers from User model
    const customers = await User.find(query, projection)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    
    // Check if it's an authentication error
    if (error.name === 'AuthenticationError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode || 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST create new customer (creates new user with role = 'user')
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Check authentication - only owners can create customers
    try {
      const user = getUserFromRequest(request);
      if (user.role !== 'owner') {
        return NextResponse.json(
          { success: false, message: 'Only store owners can create customers' },
          { status: 403 }
        );
      }
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { success: false, message: 'Name and phone are required' },
        { status: 400 }
      );
    }

    // Check if customer with same phone or email already exists
    const existingQuery: any = { $or: [] };
    
    if (body.phone) {
      existingQuery.$or.push({ phone: body.phone });
    }
    
    if (body.email) {
      existingQuery.$or.push({ email: body.email.toLowerCase() });
    }
    
    if (existingQuery.$or.length > 0) {
      const existingCustomer = await User.findOne(existingQuery);
      
      if (existingCustomer) {
        const field = existingCustomer.phone === body.phone ? 'phone' : 'email';
        return NextResponse.json(
          { 
            success: false, 
            message: `Customer with this ${field} already exists` 
          },
          { status: 400 }
        );
      }
    }

    // Prepare customer data
    const customerData: any = {
      name: body.name.trim(),
      phone: body.phone.trim(),
      role: 'user', // Always set as user for customers
      isActive: body.isActive !== undefined ? body.isActive : true,
      emailVerified: false,
      totalOrders: 0,
      totalSpent: 0,
      loyaltyPoints: 0,
    };

    // Optional fields
    if (body.email) customerData.email = body.email.toLowerCase().trim();
    if (body.address) customerData.address = body.address.trim();
    if (body.storeName) customerData.storeName = body.storeName.trim();
    if (body.storeType) customerData.storeType = body.storeType;
    if (body.gstNumber) customerData.gstNumber = body.gstNumber.toUpperCase().trim();
    if (body.city) customerData.city = body.city.trim();
    if (body.state) customerData.state = body.state.trim();
    if (body.pincode) customerData.pincode = body.pincode.trim();
    
    // Generate a default password (customer can reset later)
    const defaultPassword = `customer${Date.now().toString().slice(-6)}`;
    customerData.password = defaultPassword;

    // Create new user
    const customer = await User.create(customerData);

    // Remove sensitive data from response
    const customerResponse = customer.toObject();
    delete customerResponse.password;
    delete customerResponse.passwordChangedAt;
    delete customerResponse.passwordResetToken;
    delete customerResponse.passwordResetExpires;
    delete customerResponse.failedLoginAttempts;
    delete customerResponse.accountLockedUntil;

    return NextResponse.json({
      success: true,
      message: 'Customer created successfully',
      customer: customerResponse,
      // Include default password for initial setup (optional)
      defaultPassword: body.email ? undefined : defaultPassword,
    });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, message: messages.join(', ') },
        { status: 400 }
      );
    }
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Phone or email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to create customer' },
      { status: 500 }
    );
  }
}