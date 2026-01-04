// app/api/orders/owner/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import { getCurrentUser } from '@/lib/auth-request';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get current user (store owner)
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'owner') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch orders for this owner's store
    const orders = await Order.find({ storeId: user.userId })
      .sort({ createdAt: -1 })
      .limit(100);
    
    return NextResponse.json({
      success: true,
      orders,
      count: orders.length
    });
    
  } catch (error: any) {
    console.error('Error fetching owner orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders', error: error.message },
      { status: 500 }
    );
  }
}