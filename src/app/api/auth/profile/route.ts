import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";
import { 
  getUserFromRequest, 
  AuthenticationError
} from "@/lib/auth";

// GET Profile - Get current user's profile
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = getUserFromRequest(req);
    
    const userData = await User.findById(user.userId).select("-password -__v");

    if (!userData) {
      return NextResponse.json(
        { 
          success: false,
          message: "User not found" 
        }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        storeName: userData.storeName,
        storeType: userData.storeType,
        gstNumber: userData.gstNumber,
        role: userData.role,
        avatar: userData.avatar,
        emailVerified: userData.emailVerified,
        isActive: userData.isActive,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      }
    });

  } catch (error: any) {
    console.error("Profile GET Error:", error);

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

// UPDATE Profile - Update current user's profile
export async function PUT(req: NextRequest) {
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

    const user = await User.findById(currentUser.userId);
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          message: "User not found" 
        },
        { status: 404 }
      );
    }

    // 🔒 Prevent role changing through profile API
    if (data.role !== undefined && data.role !== user.role) {
      return NextResponse.json(
        { 
          success: false,
          message: "Role cannot be changed through profile update" 
        },
        { status: 403 }
      );
    }

    // Update basic user info
    if (data.name !== undefined) {
      if (data.name.trim().length < 2) {
        return NextResponse.json(
          { 
            success: false,
            message: "Name must be at least 2 characters long" 
          },
          { status: 400 }
        );
      }
      user.name = data.name.trim();
    }

    if (data.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return NextResponse.json(
          { 
            success: false,
            message: "Please enter a valid email address" 
          },
          { status: 400 }
        );
      }
      
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email: data.email.toLowerCase(),
        _id: { $ne: user._id }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { 
            success: false,
            message: "Email is already in use" 
          },
          { status: 409 }
        );
      }
      
      user.email = data.email.toLowerCase();
      user.emailVerified = false; // Reset email verification when email changes
    }

    if (data.phone !== undefined) {
      // Better Indian phone validation
      if (data.phone.trim() !== "") {
        const cleanPhone = data.phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
          return NextResponse.json(
            { 
              success: false,
              message: "Please enter a valid 10-digit phone number" 
            },
            { status: 400 }
          );
        }
        user.phone = cleanPhone;
      } else {
        user.phone = "";
      }
    }

    if (data.address !== undefined) {
      if (data.address.trim().length < 5) {
        return NextResponse.json(
          { 
            success: false,
            message: "Address must be at least 5 characters long" 
          },
          { status: 400 }
        );
      }
      user.address = data.address.trim();
    }

    // Update password if provided
    if (data.password !== undefined) {
      if (data.password.length < 8) {
        return NextResponse.json(
          { 
            success: false,
            message: "Password must be at least 8 characters long" 
          },
          { status: 400 }
        );
      }
      
      // For password change, we need different structure
      // This should be handled in separate password change API
      return NextResponse.json(
        { 
          success: false,
          message: "Please use /api/auth/profile/password endpoint for password change" 
        },
        { status: 400 }
      );
    }

    // ✅ CORRECTED: Check user's role from database
    if (user.role === "owner") {
      if (data.storeName !== undefined) {
        if (data.storeName.trim().length < 2) {
          return NextResponse.json(
            { 
              success: false,
              message: "Store name must be at least 2 characters long" 
            },
            { status: 400 }
          );
        }
        user.storeName = data.storeName.trim();
      }

      if (data.storeType !== undefined) {
        const validStoreTypes = ['kirana', 'supermarket', 'convenience', 'specialty', 'other'];
        if (!validStoreTypes.includes(data.storeType)) {
          return NextResponse.json(
            { 
              success: false,
              message: "Invalid store type" 
            },
            { status: 400 }
          );
        }
        user.storeType = data.storeType;
      }

      if (data.gstNumber !== undefined) {
        // Basic GST number validation
        if (data.gstNumber.trim().length > 0 && data.gstNumber.trim().length < 3) {
          return NextResponse.json(
            { 
              success: false,
              message: "GST number must be at least 3 characters long" 
            },
            { status: 400 }
          );
        }
        user.gstNumber = data.gstNumber.trim();
      }
    } else {
      // Prevent regular users from updating store-specific fields
      if (data.storeName || data.storeType || data.gstNumber) {
        return NextResponse.json(
          { 
            success: false,
            message: "Only store owners can update store information" 
          },
          { status: 403 }
        );
      }
    }

    // Update avatar if provided
    if (data.avatar !== undefined) {
      // Allow empty string or valid URL
      if (data.avatar && data.avatar.trim() !== "" && !data.avatar.startsWith('http')) {
        return NextResponse.json(
          { 
            success: false,
            message: "Avatar must be a valid URL or empty" 
          },
          { status: 400 }
        );
      }
      user.avatar = data.avatar || "";
    }

    await user.save();

    // Return updated user data (without password)
    const updatedUser = await User.findById(user._id).select("-password -__v");

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        storeName: updatedUser.storeName,
        storeType: updatedUser.storeType,
        gstNumber: updatedUser.gstNumber,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        emailVerified: updatedUser.emailVerified,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error: any) {
    console.error("Profile PUT Error:", error);

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

    // Handle MongoDB duplicate key error
    if (error.code === 11000 || error.name === 'MongoError') {
      return NextResponse.json(
        { 
          success: false,
          message: "Email already exists. Please use a different email." 
        },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          success: false,
          message: "Validation failed",
          errors 
        },
        { status: 400 }
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

// DELETE Profile - Delete user account (soft delete)
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const currentUser = getUserFromRequest(req);
    const data = await req.json();

    // Optional: Require password confirmation for deletion
    if (data.password) {
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

      const isPasswordValid = await bcrypt.compare(data.password, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { 
            success: false,
            message: "Invalid password. Account deletion requires password confirmation." 
          },
          { status: 401 }
        );
      }
    }

    // Soft delete (mark as inactive) instead of hard delete
    const user = await User.findById(currentUser.userId);
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          message: "User not found" 
        },
        { status: 404 }
      );
    }

    user.isActive = false;
    user.email = `${user.email}_deleted_${Date.now()}`; // Make email unique for reactivation
    await user.save();

    // Clear authentication cookies
    const response = NextResponse.json({
      success: true,
      message: "Account deactivated successfully. You can reactivate within 30 days by contacting support."
    });

    response.cookies.delete("token");
    response.cookies.delete("refresh_token");
    response.cookies.delete("user-info");

    return response;

  } catch (error: any) {
    console.error("Profile DELETE Error:", error);

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

// OPTIONS - Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}