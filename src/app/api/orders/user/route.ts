// app/api/orders/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import { getCurrentUser } from '@/lib/auth-request';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get current user (customer)
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch orders for this customer by email
    const orders = await Order.find({ 'customer.email': user.email })
      .sort({ createdAt: -1 })
      .limit(50);
    
    return NextResponse.json({
      success: true,
      orders,
      count: orders.length
    });
    
  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders', error: error.message },
      { status: 500 }
    );
  }
}