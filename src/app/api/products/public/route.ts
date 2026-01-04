import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sort = searchParams.get("sort") || "newest";

    // Build query - only active products
    const query: any = { isActive: true };

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } }
      ];
    }

    // Sorting
    let sortOptions: any = { createdAt: -1 }; // default: newest first
    if (sort === "price_low") sortOptions = { price: 1 };
    if (sort === "price_high") sortOptions = { price: -1 };
    if (sort === "name") sortOptions = { name: 1 };

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .select("name sku category price discount mrp image images stock unit description brand isFeatured")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    // Calculate discounted price
    const productsWithDiscount = products.map(product => {
      let finalPrice = product.price;
      
      if (product.mrp && product.discount) {
        finalPrice = product.mrp - (product.mrp * product.discount / 100);
      } else if (product.discount) {
        finalPrice = product.price - (product.price * product.discount / 100);
      }
      
      return {
        ...product,
        finalPrice: Math.round(finalPrice * 100) / 100,
        inStock: product.stock > 0
      };
    });

    // Get unique categories
    const categories = await Product.distinct("category", { isActive: true });

    return NextResponse.json({
      success: true,
      products: productsWithDiscount,
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching public products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// GET single product details
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { productId } = await req.json();
    
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true
    }).select("name sku category price discount mrp image images stock unit description brand weight dimensions");

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Calculate final price
    let finalPrice = product.price;
    if (product.mrp && product.discount) {
      finalPrice = product.mrp - (product.mrp * product.discount / 100);
    } else if (product.discount) {
      finalPrice = product.price - (product.price * product.discount / 100);
    }

    const productWithPrice = {
      ...product.toObject(),
      finalPrice: Math.round(finalPrice * 100) / 100,
      inStock: product.stock > 0,
      stockStatus: product.stock === 0 ? "out_of_stock" : 
                   product.stock < 10 ? "low_stock" : "in_stock"
    };

    return NextResponse.json({
      success: true,
      product: productWithPrice
    });

  } catch (error) {
    console.error("Error fetching product details:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product details" },
      { status: 500 }
    );
  }
}