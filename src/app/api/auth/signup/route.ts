// src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password, conformPassword, role, storeName, storeType, phone } = await req.json();

    // Basic validation
    if (!name || !email || !password || !conformPassword || !role) {
      return NextResponse.json({ 
        success: false, 
        message: "All fields are required" 
      }, { status: 400 });
    }

    if (password !== conformPassword) {
      return NextResponse.json({ 
        success: false, 
        message: "Passwords do not match" 
      }, { status: 400 });
    }

    if (role === "owner" && !storeName) {
      return NextResponse.json({ 
        success: false, 
        message: "Store name is required for owners" 
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: "User already exists with this email" 
      }, { status: 409 });
    }

    // Create user
    const userData: any = { 
      name, 
      email: email.toLowerCase(), 
      password, // Password will be hashed by pre-save middleware
      role,
      phone: phone || ''
    };

    if (role === "owner") {
      userData.storeName = storeName;
      userData.storeType = storeType || 'kirana';
    }

    // Set default preferences
    userData.preferences = {
      notifications: {
        email: true,
        sms: true,
        push: true
      },
      theme: 'light',
      language: 'en'
    };

    const user = await User.create(userData);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({ 
      success: true, 
      message: "Signup successful", 
      user: userResponse 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Server error. Please try again later." 
    }, { status: 500 });
  }
}