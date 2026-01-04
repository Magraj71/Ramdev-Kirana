import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const user = getUserFromRequest(req);
    
    // Get user's wishlist with product details
    const wishlistItems = await Wishlist.find({ userId: user.userId })
      .populate({
        path: 'productId',
        select: 'name price category images sku stock'
      })
      .sort({ addedAt: -1 })
      .limit(10); // Limit to 10 items for dashboard

    // Format the response
    const formattedWishlist = wishlistItems.map(item => {
      const product = item.productId as any;
      return {
        _id: item._id.toString(),
        productId: product?._id?.toString() || '',
        name: product?.name || 'Product not found',
        price: product?.price ? `₹${product.price}` : '₹0',
        category: product?.category || 'Uncategorized',
        image: product?.images?.[0] || '🟨', // Default emoji if no image
        sku: product?.sku || '',
        stock: product?.stock || 0
      };
    });

    return NextResponse.json({
      success: true,
      wishlist: formattedWishlist,
      count: wishlistItems.length
    });

  } catch (error: any) {
    console.error("Wishlist GET Error:", error);
    
    if (error.name === 'AuthenticationError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    // Return empty wishlist if no items or error
    return NextResponse.json({
      success: true,
      wishlist: [],
      count: 0
    });
  }
}

// POST - Add to wishlist
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const user = getUserFromRequest(req);
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Check if already in wishlist
    const existingWishlistItem = await Wishlist.findOne({
      userId: user.userId,
      productId
    });

    if (existingWishlistItem) {
      return NextResponse.json({
        success: true,
        message: "Product already in wishlist",
        wishlistItem: existingWishlistItem
      });
    }

    // Add to wishlist
    const wishlistItem = await Wishlist.create({
      userId: user.userId,
      productId,
      addedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: "Added to wishlist",
      wishlistItem
    });

  } catch (error: any) {
    console.error("Wishlist POST Error:", error);
    
    if (error.name === 'AuthenticationError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({
        success: true,
        message: "Product already in wishlist"
      });
    }

    return NextResponse.json(
      { success: false, message: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}