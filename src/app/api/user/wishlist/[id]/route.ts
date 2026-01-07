import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Wishlist from "@/models/Wishlist";
import { getUserFromRequest } from "@/lib/auth";
import mongoose from "mongoose";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = getUserFromRequest(req);
    if (!user || !user.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid wishlist item ID" },
        { status: 400 }
      );
    }

    const result = await Wishlist.findOneAndDelete({
      _id: id,
      userId: user.userId
    });

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Wishlist item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Removed from wishlist",
      deletedId: id
    });

  } catch (error: any) {
    console.error("Wishlist delete error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}