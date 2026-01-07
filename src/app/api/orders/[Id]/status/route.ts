import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { Id: string } }
) {
  try {
    await connectDB();

    const { Id } =await params;

    // 🔍 DEBUG
    console.log("ORDER ID:", Id);

    if (!mongoose.Types.ObjectId.isValid(Id)) {
      return NextResponse.json(
        { message: "Invalid order ID" },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { status } = body;

    console.log("NEW STATUS:", status);

    if (!status) {
      return NextResponse.json(
        { message: "Status is required" },
        { status: 400 }
      );
    }

    const allowedStatus = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ];

    if (!allowedStatus.includes(status)) {
      return NextResponse.json(
        { message: `Invalid status: ${status}` },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(
      Id,
      { status },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("STATUS UPDATE ERROR:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
