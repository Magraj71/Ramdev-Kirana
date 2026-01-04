import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { getUserFromRequest } from "@/lib/auth";

// PATCH - Update product stock
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    
    // ✅ Correct way to get params in Next.js 15
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const { stock } = await req.json();

    if (stock === undefined || stock === null) {
      return NextResponse.json(
        { success: false, message: "Stock value is required" },
        { status: 400 }
      );
    }

    const stockValue = parseInt(stock);
    if (isNaN(stockValue)) {
      return NextResponse.json(
        { success: false, message: "Invalid stock value" },
        { status: 400 }
      );
    }

    // Update only products belonging to this store
    const product = await Product.findOneAndUpdate(
      { 
        _id: productId,
        storeId: user.userId 
      },
      { 
        stock: stockValue,
        updatedBy: user.userId
      },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Stock updated successfully",
      product
    });

  } catch (error) {
    console.error("Error updating stock:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update stock" },
      { status: 500 }
    );
  }
}

// Alternative GET endpoint to get product stock
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    
    // ✅ Correct way to get params in Next.js 15
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await Product.findOne({
      _id: productId,
      storeId: user.userId
    }).select("stock name sku");

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      stock: product.stock,
      productName: product.name,
      sku: product.sku
    });

  } catch (error) {
    console.error("Error fetching stock:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stock" },
      { status: 500 }
    );
  }
}