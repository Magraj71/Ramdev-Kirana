// app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { productId, quantity = 1, action = "add" } = await req.json();
    
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }
    
    const product = await Product.findOne({
      _id: productId,
      isActive: true,
      stock: { $gt: 0 }
    });
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not available" },
        { status: 404 }
      );
    }
    
    if (quantity > product.stock) {
      return NextResponse.json(
        { success: false, message: `Only ${product.stock} units available` },
        { status: 400 }
      );
    }
    
    // Calculate price
    let finalPrice = product.price;
    if (product.mrp && product.discount) {
      finalPrice = product.mrp - (product.mrp * product.discount / 100);
    } else if (product.discount) {
      finalPrice = product.price - (product.price * product.discount / 100);
    }
    
    const cartItem = {
      productId: product._id,
      name: product.name,
      sku: product.sku,
      quantity,
      unitPrice: finalPrice,
      totalPrice: finalPrice * quantity,
      discount: product.discount || 0,
      unit: product.unit,
      image: product.image || "",
      stock: product.stock,
      maxQuantity: product.stock
    };
    
    return NextResponse.json({
      success: true,
      message: "Product added to cart",
      cartItem
    });
    
  } catch (error) {
    console.error("Cart error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// Get cart items with details
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const productIds = searchParams.get("ids");
    
    if (!productIds) {
      return NextResponse.json({
        success: true,
        cart: [],
        total: 0,
        itemCount: 0
      });
    }
    
    const ids = productIds.split(",");
    const products = await Product.find({
      _id: { $in: ids },
      isActive: true
    });
    
    const cartItems = products.map(product => {
      let finalPrice = product.price;
      if (product.mrp && product.discount) {
        finalPrice = product.mrp - (product.mrp * product.discount / 100);
      } else if (product.discount) {
        finalPrice = product.price - (product.price * product.discount / 100);
      }
      
      return {
        productId: product._id,
        name: product.name,
        sku: product.sku,
        quantity: 1,
        unitPrice: finalPrice,
        totalPrice: finalPrice,
        discount: product.discount || 0,
        unit: product.unit,
        image: product.image || "",
        stock: product.stock,
        maxQuantity: product.stock
      };
    });
    
    const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    
    return NextResponse.json({
      success: true,
      cart: cartItems,
      total: parseFloat(total.toFixed(2)),
      itemCount: cartItems.length
    });
    
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}