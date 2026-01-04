import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);

    const storeId = user.userId;

    // Get total products count
    const totalProducts = await Product.countDocuments({ storeId });

    // Get low stock products (stock < minStockLevel)
    const lowStock = await Product.countDocuments({
      storeId,
      stock: { $lt: "$minStockLevel" },
      stock: { $gt: 0 }
    });

    // Get out of stock products
    const outOfStock = await Product.countDocuments({
      storeId,
      stock: 0
    });

    // Calculate total inventory value
    const inventoryValue = await Product.aggregate([
      { $match: { storeId } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ["$costPrice", "$stock"] } }
        }
      }
    ]);

    const totalValue = inventoryValue[0]?.totalValue || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        lowStock,
        outOfStock,
        totalValue
      }
    });

  } catch (error) {
    console.error("Error fetching product stats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}