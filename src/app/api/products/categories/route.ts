import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);

    const categories = await Product.aggregate([
      { $match: { storeId: user.userId } },
      {
        $group: {
          _id: "$category",
          productCount: { $sum: 1 }
        }
      },
      { $sort: { productCount: -1 } },
      {
        $project: {
          name: "$_id",
          productCount: 1,
          _id: 1
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}