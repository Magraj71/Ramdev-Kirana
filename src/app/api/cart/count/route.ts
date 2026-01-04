// src/app/api/cart/count/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);

    // Get cart from database
    const cart = await Cart.findOne({ userId: user.userId });
    
    let cartCount = 0;
    if (cart && Array.isArray(cart.items)) {
      cartCount = cart.items.length;
    }

    return NextResponse.json({
      success: true,
      count: cartCount
    });

  } catch (error) {
    console.error("Error fetching cart count:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch cart count",
        count: 0
      },
      { status: 500 }
    );
  }
}

// Alternative: Store cart in database
// src/app/api/cart/route.ts
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const data = await req.json();
    
    // Store cart in database for this user
    // Implementation depends on your Cart model
    
    return NextResponse.json({
      success: true,
      message: "Cart saved"
    });
  } catch (error) {
    console.error("Error saving cart:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save cart" },
      { status: 500 }
    );
  }
}