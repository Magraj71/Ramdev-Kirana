

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { createToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false,
          message: "Email and password are required" 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false,
          message: "Please enter a valid email address" 
        },
        { status: 400 }
      );
    }

    // Find user with password field (select +password)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    console.log(user);
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          message: "Invalid email or password" 
        },
        { status: 401 }
      );
    }

    // Check if user account is active
    if (!user.isActive) {
      return NextResponse.json(
        { 
          success: false,
          message: "Your account has been deactivated. Please contact support." 
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(isPasswordValid);
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false,
          message: "Invalid email or password" 
        },
        { status: 401 }
      );
    }

    // Check if email is verified (optional - you can enforce or just warn)
    if (!user.emailVerified) {
      // You can either block login or allow with a warning
      // For now, we'll allow but include a flag
    }

    // Create JWT token with complete user information
    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      storeName: user.storeName,
      storeType: user.storeType,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      isActive: user.isActive
    });

    // Prepare user response (exclude sensitive data)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      storeName: user.storeName,
      storeType: user.storeType,
      gstNumber: user.gstNumber,
      role: user.role,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    // Create HTTP-only cookie for authentication
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: userResponse,
      requiresEmailVerification: !user.emailVerified
    }, { status: 200 });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Optional: Set a non-httpOnly cookie for client-side access to user info
    // (if needed for quick access without API call)
    response.cookies.set({
      name: "user-info",
      value: JSON.stringify({
        name: user.name,
        email: user.email,
        role: user.role,
        storeName: user.storeName
      }),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.name === 'MongooseError' || error.name === 'MongoError') {
        return NextResponse.json(
          { 
            success: false,
            message: "Database connection error. Please try again." 
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false,
        message: "Internal server error. Please try again later." 
      },
      { status: 500 }
    );
  }
}