import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Wishlist from "@/models/Wishlist";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    
    const user = getUserFromRequest(req);
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Wishlist item ID is required" },
        { status: 400 }
      );
    }

    // Find and delete the wishlist item
    const wishlistItem = await Wishlist.findOneAndDelete({
      _id: id,
      userId: user.userId
    });

    if (!wishlistItem) {
      return NextResponse.json(
        { success: false, message: "Wishlist item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Removed from wishlist",
      removedItemId: id
    });

  } catch (error: any) {
    console.error("Wishlist DELETE Error:", error);
    
    if (error.name === 'AuthenticationError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}