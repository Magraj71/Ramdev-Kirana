// app/api/customers/[email]/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';

// GET: Get quick stats for customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    // Await the params Promise first
    const { email } = await params;
    await connectDB();
    
    const decodedEmail = decodeURIComponent(email);
    
    // Get customer
    const customer = await User.findOne({ email: decodedEmail })
      .select('name email phone createdAt')
      .lean();
    
    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }
    
    // Get orders summary
    const orders = await Order.find({ 'customer.email': decodedEmail })
      .select('totalAmount status createdAt items')
      .lean();
    
    // Calculate stats
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;
    
    // Status counts
    const statusCounts = {
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };
    
    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyOrders = orders
      .filter(o => new Date(o.createdAt) >= sixMonthsAgo)
      .reduce((acc: any, order) => {
        const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});
    
    // Favorite products
    const allItems = orders.flatMap(order => order.items || []);
    const productFrequency: Record<string, number> = {};
    
    allItems.forEach(item => {
      const key = item.name || item.productId;
      if (key) {
        productFrequency[key] = (productFrequency[key] || 0) + (item.quantity || 1);
      }
    });
    
    const topProducts = Object.entries(productFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    
    return NextResponse.json({
      success: true,
      stats: {
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          customerSince: customer.createdAt,
          daysAsCustomer: Math.floor(
            (new Date().getTime() - new Date(customer.createdAt).getTime()) / 
            (1000 * 60 * 60 * 24)
          )
        },
        orders: {
          total: totalOrders,
          totalSpent,
          avgOrderValue,
          ...statusCounts
        },
        trends: {
          monthly: monthlyOrders,
          topProducts,
          successRate: statusCounts.delivered > 0 ? 
            Math.round((statusCounts.delivered / totalOrders) * 100) : 0
        }
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching customer stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch customer stats', error: error.message },
      { status: 500 }
    );
  }
}