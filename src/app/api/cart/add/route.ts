import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const user = getUserFromRequest(req);
    const { productId, quantity = 1 } = await req.json();

    // Here you would add to cart in your database
    // For now, return success
    
    return NextResponse.json({
      success: true,
      message: "Added to cart successfully"
    });

  } catch (error: any) {
    console.error("Add to cart error:", error);
    
    if (error.name === 'AuthenticationError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to add to cart" },
      { status: 500 }
    );
  }
}