import { NextResponse } from "next/server";

// GET Notifications - Return empty array for now
export async function GET() {
  return NextResponse.json({
    success: true,
    notifications: []
  });
}

// DELETE All Notifications
export async function DELETE() {
  return NextResponse.json({
    success: true,
    message: "Notifications cleared"
  });
}