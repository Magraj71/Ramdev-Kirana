import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import User from "@/models/User";
import Order from "@/models/Order"; // You'll need to create this
import Product from "@/models/Product"; // You'll need to create this

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = getUserFromRequest(req);
    
    // Get user data
    const userData = await User.findById(user.userId);
    
    if (!userData) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Get orders count (replace with your actual Order model)
    const totalOrders = 24; // Mock data
    const pendingOrders = 2; // Mock data
    const completedOrders = 22; // Mock data
    
    // Get total spent (mock for now)
    const totalSpent = 42850;
    
    // Get wishlist items count (you need a Wishlist model)
    const wishlistItems = 4; // Mock data

    // Calculate monthly orders
    const currentMonth = new Date().getMonth();
    const monthlyOrders = 8; // Mock data

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    return NextResponse.json({
      success: true,
      stats: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        location: userData.address || "Not set",
        membership: userData.role === 'owner' ? 'Store Owner' : 'Gold Member',
        joinDate: new Date(userData.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSpent: `₹${totalSpent.toLocaleString('en-IN')}`,
        loyaltyPoints: 1250, // You can calculate this based on orders
        monthlyOrders,
        averageOrderValue: `₹${averageOrderValue.toFixed(0)}`,
        wishlistItems
      }
    });

  } catch (error: any) {
    console.error("User stats error:", error);
    
    if (error.name === 'AuthenticationError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to load user stats" },
      { status: 500 }
    );
  }
}