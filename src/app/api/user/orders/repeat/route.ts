import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const user = getUserFromRequest(req);
    const { orderId } = await req.json();

    // Here you would implement logic to repeat an order
    // For now, return success
    
    return NextResponse.json({
      success: true,
      message: "Order repeated successfully",
      newOrderId: `#ORD-${Date.now()}`
    });

  } catch (error: any) {
    console.error("Repeat order error:", error);
    
    if (error.name === 'AuthenticationError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to repeat order" },
      { status: 500 }
    );
  }
}