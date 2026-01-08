// app/api/customers/[email]/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User'; // or Customer model

// GET: Fetch orders for specific customer by email
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    // Await the params Promise first
    const { email } = await params;
    await connectDB();
    
    const decodedEmail = decodeURIComponent(email);
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Check if customer exists
    const customer = await User.findOne({ email: decodedEmail })
      .select('name email phone address storeName storeType createdAt')
      .lean();
    
    if (!customer) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Customer not found',
          orders: [],
          customerInfo: null,
          stats: {
            totalOrders: 0,
            totalSpent: 0,
            avgOrderValue: 0,
            deliveredOrders: 0,
            pendingOrders: 0
          }
        },
        { status: 404 }
      );
    }
    
    // Build query
    let query: any = { 'customer.email': decodedEmail };
    
    // Apply filters
    if (filter !== 'all') {
      query.status = filter;
    }
    
    // Calculate date range for stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get all orders for stats calculation
    const allOrders = await Order.find({ 'customer.email': decodedEmail })
      .select('totalAmount status createdAt')
      .lean();
    
    // Calculate stats
    const totalOrders = allOrders.length;
    const totalSpent = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;
    const deliveredOrders = allOrders.filter(o => o.status === 'delivered').length;
    const pendingOrders = allOrders.filter(o => 
      ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)
    ).length;
    
    // Recent orders (last 30 days)
    const recentOrdersCount = allOrders.filter(
      o => new Date(o.createdAt) >= thirtyDaysAgo
    ).length;
    
    // Get paginated orders with full details
    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const orders = await Order.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Format customer info
    const customerInfo = {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      storeName: customer.storeName,
      storeType: customer.storeType,
      customerSince: customer.createdAt,
      
      // Statistics
      totalOrders,
      totalSpent,
      avgOrderValue,
      deliveredOrders,
      pendingOrders,
      recentOrders: recentOrdersCount,
      
      // Additional metrics
      successRate: deliveredOrders > 0 ? 
        Math.round((deliveredOrders / totalOrders) * 100) : 0,
      avgOrderFrequency: recentOrdersCount > 0 ? 
        Math.round(30 / recentOrdersCount) : 0 // days between orders
    };
    
    return NextResponse.json({
      success: true,
      orders,
      customerInfo,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNextPage: page < Math.ceil(totalOrders / limit),
        hasPrevPage: page > 1
      },
      filters: {
        applied: filter,
        available: [
          { value: 'all', label: 'All Orders', count: totalOrders },
          { value: 'pending', label: 'Pending', count: allOrders.filter(o => o.status === 'pending').length },
          { value: 'confirmed', label: 'Confirmed', count: allOrders.filter(o => o.status === 'confirmed').length },
          { value: 'processing', label: 'Processing', count: allOrders.filter(o => o.status === 'processing').length },
          { value: 'shipped', label: 'Shipped', count: allOrders.filter(o => o.status === 'shipped').length },
          { value: 'delivered', label: 'Delivered', count: deliveredOrders },
          { value: 'cancelled', label: 'Cancelled', count: allOrders.filter(o => o.status === 'cancelled').length }
        ]
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch customer orders',
        error: error.message 
      },
      { status: 500 }
    );
  }
}