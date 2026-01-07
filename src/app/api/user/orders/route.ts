import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getUserFromRequest } from "@/lib/auth";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = getUserFromRequest(req);
    if (!user || !user.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    // Get user email to fetch orders
    const userDoc = await User.findById(user.userId).select("email");
    if (!userDoc) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Build query
    const query: any = { 'customer.email': userDoc.email };
    if (status && status !== "all") {
      query.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("orderId createdAt items totalAmount status payment delivery")
        .lean(),
      Order.countDocuments(query)
    ]);

    // Format orders
    const formattedOrders = orders.map(order => ({
      id: order.orderId,
      date: new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      items: order.items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0,
      amount: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
      }).format(order.totalAmount || 0),
      status: order.status,
      tracking: order.delivery?.trackingNumber || "",
      customer: order.customer?.name || "Customer",
      paymentMethod: order.payment?.method || 'cod'
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error("Get user orders error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}