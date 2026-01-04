// app/api/orders/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import { getCurrentUser } from '@/lib/auth-request';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Get current user
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'owner') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    const { status } = await request.json();
    
    // Find order
    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Verify owner owns this order's store
    if (order.storeId.toString() !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this order' },
        { status: 403 }
      );
    }
    
    // Update status
    order.status = status;
    order.updatedAt = new Date();
    await order.save();
    
    return NextResponse.json({
      success: true,
      message: 'Order status updated',
      order
    });
    
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order status', error: error.message },
      { status: 500 }
    );
  }
}