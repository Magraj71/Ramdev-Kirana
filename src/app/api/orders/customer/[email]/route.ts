import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';

connectDB();

// GET - Get customer orders by email
export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const customerEmail = decodeURIComponent(params.email);
    
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: 'Store ID is required' },
        { status: 400 }
      );
    }

    const orders = await Order.find({
      storeId,
      'customer.email': customerEmail
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('items.productId', 'name image')
    .lean();

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length
    });

  } catch (error: any) {
    console.error('Get customer orders error:', error);
    
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