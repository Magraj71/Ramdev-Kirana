import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-request";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
// import connectDB from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Fetch complete user data from database
    const user = await User.findById(currentUser.userId).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeName: user.storeName,
        storeType: user.storeType,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}