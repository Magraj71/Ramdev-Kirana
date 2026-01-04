import { NextResponse } from "next/server";

// PATCH Notification - Mark as read
export async function PATCH() {
  return NextResponse.json({
    success: true,
    message: "Notification marked as read"
  });
}