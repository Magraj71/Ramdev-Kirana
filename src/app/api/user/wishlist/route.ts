import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";
import { getUserFromRequest } from "@/lib/auth";

// GET wishlist items
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const user = getUserFromRequest(req);
    if (!user || !user.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const wishlistItems = await Wishlist.find({ userId: user.userId })
      .populate({
        path: "productId",
        select: "name price category images stock sku",
        model: Product
      })
      .sort({ createdAt: -1 })
      .lean();
    
    const formattedWishlist = wishlistItems
      .filter(item => item.productId)
      .map(item => {
        const product = item.productId as any;
        return {
          _id: item._id.toString(),
          name: product?.name || "Product",
          price: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
          }).format(product?.price || 0),
          category: product?.category || "General",
          image: product?.images?.[0] || product?.image || "📦",
          productId: product?._id?.toString() || "",
          sku: product?.sku || "",
          stock: product?.stock || 0
        };
      });
    
    return NextResponse.json({
      success: true,
      wishlist: formattedWishlist,
      count: formattedWishlist.length
    });
    
  } catch (error: any) {
    console.error("Wishlist fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// Add to wishlist
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const user = getUserFromRequest(req);
    if (!user || !user.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { productId } = await req.json();
    
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }
    
    // Check if already in wishlist
    const existing = await Wishlist.findOne({
      userId: user.userId,
      productId
    });
    
    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Already in wishlist",
        isNew: false
      });
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }
    
    // Add to wishlist
    const wishlistItem = new Wishlist({
      userId: user.userId,
      productId
    });
    
    await wishlistItem.save();
    
    return NextResponse.json({
      success: true,
      message: "Added to wishlist",
      isNew: true,
      wishlistItem: {
        _id: wishlistItem._id,
        productId: product._id,
        name: product.name,
        price: product.price
      }
    });
    
  } catch (error: any) {
    console.error("Add to wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}