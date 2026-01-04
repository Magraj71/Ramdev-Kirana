import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";
import { 
  getUserFromRequest, 
  AuthenticationError
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const currentUser = getUserFromRequest(req);
    const data = await req.json();

    // Validate request body
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { 
          success: false,
          message: "Invalid request body" 
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword, confirmPassword } = data;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { 
          success: false,
          message: "All password fields are required" 
        },
        { status: 400 }
      );
    }

    // Get user with password
    const user = await User.findById(currentUser.userId).select("+password");
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          message: "User not found" 
        },
        { status: 404 }
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { 
          success: false,
          message: "Current password is incorrect" 
        },
        { status: 401 }
      );
    }

    // Validate new password
    if (newPassword.length < 8) {
      return NextResponse.json(
        { 
          success: false,
          message: "Password must be at least 8 characters long" 
        },
        { status: 400 }
      );
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { 
          success: false,
          message: "New password must be different from current password" 
        },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { 
          success: false,
          message: "New password and confirmation do not match" 
        },
        { status: 400 }
      );
    }

    // Update password
    // user.password = await bcrypt.hash(newPassword, 10);
    
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error: any) {
    console.error("Password Update Error:", error);

    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { 
          success: false,
          message: error.message,
          code: error.code
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        message: "Internal server error" 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  return await POST(req); // Support both POST and PATCH
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}