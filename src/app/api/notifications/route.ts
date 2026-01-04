// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);

    // Get unread notifications count or list
    const { searchParams } = new URL(req.url);
    const countOnly = searchParams.get("count") === "true";
    const limit = parseInt(searchParams.get("limit") || "10");

    if (countOnly) {
      // Return only count of unread notifications
      const unreadCount = await Notification.countDocuments({
        userId: user.userId,
        read: false
      });

      return NextResponse.json({
        success: true,
        count: unreadCount
      });
    }

    // Return notifications list
    const notifications = await Notification.find({
      userId: user.userId
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Mark as read if requested
    const markRead = searchParams.get("markRead") === "true";
    if (markRead && notifications.length > 0) {
      await Notification.updateMany(
        { 
          userId: user.userId,
          read: false 
        },
        { 
          $set: { read: true, readAt: new Date() }
        }
      );
    }

    return NextResponse.json({
      success: true,
      notifications
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST - Create notification
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    
    const data = await req.json();

    if (!data.title || !data.message) {
      return NextResponse.json(
        { success: false, message: "Title and message are required" },
        { status: 400 }
      );
    }

    const notification = new Notification({
      userId: user.userId,
      title: data.title,
      message: data.message,
      type: data.type || "info", // info, success, warning, error
      link: data.link,
      metadata: data.metadata,
      read: false
    });

    await notification.save();

    return NextResponse.json({
      success: true,
      message: "Notification created",
      notification
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create notification" },
      { status: 500 }
    );
  }
}

// PATCH - Mark all as read
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);

    await Notification.updateMany(
      { 
        userId: user.userId,
        read: false 
      },
      { 
        $set: { 
          read: true, 
          readAt: new Date() 
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read"
    });

  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { success: false, message: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}