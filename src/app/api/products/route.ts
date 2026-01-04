import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query for owner's store
    const query: any = { storeId: user.userId };

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("🟢 Starting product creation...");
    await connectDB();
    const user = getUserFromRequest(req);

    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.price || !data.costPrice || !data.category) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: name, price, costPrice, category" },
        { status: 400 }
      );
    }

    // ✅ Ensure SKU is uppercase before saving
    if (data.sku && data.sku.trim()) {
      data.sku = data.sku.toUpperCase().trim();
    } else {
      // Generate SKU if not provided
      const storePrefix = user.storeName?.substring(0, 3).toUpperCase() || "PRO";
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      data.sku = `${storePrefix}-${timestamp}${random}`;
      console.log("🟢 Generated SKU:", data.sku);
    }

    // ✅ Add store reference
    data.storeId = user.userId;
    data.createdBy = user.userId;
    
    // ✅ Clean data - remove undefined/null fields
    const cleanData: any = {
      storeId: data.storeId,
      createdBy: data.createdBy,
      name: data.name.trim(),
      sku: data.sku,
      category: data.category.trim(),
      price: parseFloat(data.price),
      costPrice: parseFloat(data.costPrice),
      stock: parseInt(data.stock) || 0,
      minStockLevel: parseInt(data.minStockLevel) || 10,
      unit: data.unit || "piece",
      isActive: data.isActive !== undefined ? data.isActive : true,
      isFeatured: data.isFeatured || false
    };

    // ✅ Add optional fields if they exist
    if (data.barcode) cleanData.barcode = data.barcode.trim();
    if (data.subcategory) cleanData.subcategory = data.subcategory.trim();
    if (data.brand) cleanData.brand = data.brand.trim();
    if (data.description) cleanData.description = data.description.trim();
    if (data.mrp) cleanData.mrp = parseFloat(data.mrp);
    if (data.discount) cleanData.discount = parseFloat(data.discount);
    if (data.taxRate) cleanData.taxRate = parseFloat(data.taxRate);
    if (data.maxStockLevel) cleanData.maxStockLevel = parseInt(data.maxStockLevel);
    if (data.weight) cleanData.weight = parseFloat(data.weight);
    if (data.reorderLevel) cleanData.reorderLevel = parseInt(data.reorderLevel);
    
    // ✅ Handle image fields
    if (data.image) cleanData.image = data.image;
    if (data.images && Array.isArray(data.images)) cleanData.images = data.images;
    
    // ✅ Handle dimensions
    if (data.dimensions && 
        (data.dimensions.length || data.dimensions.width || data.dimensions.height)) {
      cleanData.dimensions = {};
      if (data.dimensions.length) cleanData.dimensions.length = parseFloat(data.dimensions.length);
      if (data.dimensions.width) cleanData.dimensions.width = parseFloat(data.dimensions.width);
      if (data.dimensions.height) cleanData.dimensions.height = parseFloat(data.dimensions.height);
    }
    
    // ✅ Handle supplier
    if (data.supplier && 
        (data.supplier.name || data.supplier.contact || data.supplier.email)) {
      cleanData.supplier = {};
      if (data.supplier.name) cleanData.supplier.name = data.supplier.name.trim();
      if (data.supplier.contact) cleanData.supplier.contact = data.supplier.contact.trim();
      if (data.supplier.email) cleanData.supplier.email = data.supplier.email.trim();
    }

    console.log("🟢 Clean data for creation:", JSON.stringify(cleanData, null, 2));

    // ✅ Create product
    const product = await Product.create(cleanData);
    console.log("🟢 Product created successfully:", product._id);

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product
    }, { status: 201 });

  } catch (error: any) {
    console.error("🔴 Error creating product:", error);
    
    // Handle specific errors
    let message = "Failed to create product";
    let status = 500;

    if (error.code === 11000) {
      message = "SKU already exists. Please use a different SKU.";
      status = 409;
    } else if (error.name === "ValidationError") {
      console.error("🔴 Validation errors:", error.errors);
      message = Object.values(error.errors).map((err: any) => err.message).join(", ");
      status = 400;
    } else {
      message = error.message || "Internal server error";
    }

    return NextResponse.json(
      { 
        success: false, 
        message,
        error: process.env.NODE_ENV === "development" ? error.message : undefined 
      },
      { status }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);

    const { productIds } = await req.json();

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      );
    }

    // Delete only products belonging to this store
    const result = await Product.deleteMany({
      _id: { $in: productIds },
      storeId: user.userId
    });

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} product(s) deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error("Error deleting products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete products" },
      { status: 500 }
    );
  }
}