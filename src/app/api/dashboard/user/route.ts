import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Order from "@/models/Order";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // 🔐 Auth
    const user = getUserFromRequest(req);
    if (!user || !user.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    const userId = new mongoose.Types.ObjectId(user.userId);
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get user details first
    const userDoc = await User.findById(userId).select("name email phone address createdAt");
    if (!userDoc) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // ⚡ Parallel requests for better performance
    const [
      allOrders,
      recentOrders,
      wishlistItems,
      monthlyOrdersCount
    ] = await Promise.all([
      // Get all orders for stats
      Order.find({ 'customer.email': userDoc.email }),
      
      // Get recent orders (limited)
      Order.find({ 'customer.email': userDoc.email })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("orderId createdAt items totalAmount status payment delivery"),
      
      // Get wishlist with populated products
      Wishlist.find({ userId })
        .populate({
          path: "productId",
          select: "name price category images stock sku",
          model: Product
        }),
      
      // Get monthly orders count
      Order.countDocuments({ 
        'customer.email': userDoc.email,
        createdAt: { $gte: firstDayOfMonth }
      })
    ]);

    // 📊 CALCULATE STATS
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(o => 
      ["pending", "processing", "confirmed"].includes(o.status)
    ).length;
    
    const completedOrders = allOrders.filter(o => 
      ["delivered", "completed"].includes(o.status)
    ).length;

    const totalSpentNumber = allOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    const averageOrderValue = totalOrders > 0 
      ? Math.round(totalSpentNumber / totalOrders)
      : 0;

    // Calculate loyalty points
    const loyaltyPoints = completedOrders * 10 + Math.floor(totalSpentNumber / 100);

    // Format user stats
    const stats = {
      name: userDoc.name || "User",
      email: userDoc.email || "",
      phone: userDoc.phone || "Not provided",
      location: userDoc.address?.city || userDoc.address?.state || "Location not set",
      membership: loyaltyPoints > 500 ? "Platinum" : loyaltyPoints > 200 ? "Gold" : "Silver",
      joinDate: userDoc.createdAt 
        ? new Date(userDoc.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : "Recently",
      totalOrders,
      pendingOrders,
      completedOrders,
      totalSpent: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
      }).format(totalSpentNumber),
      loyaltyPoints,
      monthlyOrders: monthlyOrdersCount,
      averageOrderValue: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
      }).format(averageOrderValue),
      wishlistItems: wishlistItems.length
    };

    // 📦 FORMAT RECENT ORDERS
    const formattedOrders = recentOrders.map(order => {
      // Calculate total items count
      const totalItems = order.items?.reduce((sum: number, item: any) => 
        sum + (item.quantity || 0), 0) || 0;
      
      // Map status
      const statusMap: Record<string, 'delivered' | 'processing' | 'pending'> = {
        'delivered': 'delivered',
        'completed': 'delivered',
        'processing': 'processing',
        'confirmed': 'processing',
        'pending': 'pending'
      };

      return {
        id: order.orderId || `ORD-${order._id.toString().slice(-8).toUpperCase()}`,
        date: new Date(order.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        items: totalItems,
        amount: new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
        }).format(order.totalAmount || 0),
        status: statusMap[order.status] || 'pending',
        tracking: order.delivery?.trackingNumber || `TRK-${order._id.toString().slice(-8).toUpperCase()}`,
        customer: order.customer?.name || userDoc.name,
        paymentMethod: order.payment?.method || 'cod',
        expectedDelivery: order.delivery?.expectedDate ? 
          new Date(order.delivery.expectedDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
          }) : 'Soon'
      };
    });

    // ❤️ FORMAT WISHLIST
    const formattedWishlist = wishlistItems
      .filter(item => item.productId)
      .map(item => {
        const product = item.productId as any;
        return {
          _id: item._id.toString(),
          name: product?.name || "Product",
          price: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
          }).format(product?.price || 0),
          category: product?.category || "General",
          image: product?.images?.[0] || product?.image || 
                (product?.category === "Electronics" ? "📱" : 
                 product?.category === "Fashion" ? "👕" : "📦"),
          productId: product?._id?.toString() || "",
          sku: product?.sku || "",
          stock: product?.stock || 0
        };
      });

    // ✅ SUCCESS RESPONSE
    return NextResponse.json({
      success: true,
      stats,
      recentOrders: formattedOrders,
      wishlist: formattedWishlist,
      lastUpdated: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("🚨 User dashboard error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to load dashboard data",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}