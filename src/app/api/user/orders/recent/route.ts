import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const user = getUserFromRequest(req);
    
    // Mock recent orders data - replace with actual database query
    const recentOrders = [
      { 
        id: "#ORD-7821", 
        date: "Dec 15, 2023", 
        items: 5, 
        amount: "₹1,250", 
        status: "delivered", 
        tracking: "DL-7821RJ",
        customer: "Rahul Sharma"
      },
      { 
        id: "#ORD-7820", 
        date: "Dec 14, 2023", 
        items: 3, 
        amount: "₹850", 
        status: "processing", 
        tracking: "SH-7820RJ",
        customer: "Rahul Sharma"
      },
      { 
        id: "#ORD-7819", 
        date: "Dec 12, 2023", 
        items: 8, 
        amount: "₹2,100", 
        status: "delivered", 
        tracking: "DL-7819RJ",
        customer: "Rahul Sharma"
      },
      { 
        id: "#ORD-7818", 
        date: "Dec 10, 2023", 
        items: 2, 
        amount: "₹560", 
        status: "pending", 
        tracking: "PD-7818RJ",
        customer: "Rahul Sharma"
      },
    ];

    return NextResponse.json({
      success: true,
      orders: recentOrders
    });

  } catch (error: any) {
    console.error("Recent orders error:", error);
    
    if (error.name === 'AuthenticationError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to load recent orders" },
      { status: 500 }
    );
  }
}