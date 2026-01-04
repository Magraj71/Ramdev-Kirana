import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { getUserFromRequest } from "@/lib/auth";

// GET - Get single product
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
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
    }).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product
    });

  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT - Update product
// PUT - Update product
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("🟢 Starting product update...");
    await connectDB();
    const user = getUserFromRequest(req);
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const data = await req.json();
    console.log("🟢 Received update data:", JSON.stringify(data, null, 2));

    // Validate required fields
    if (!data.name || !data.price || !data.costPrice || !data.category) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: name, price, costPrice, category" },
        { status: 400 }
      );
    }

    // Ensure SKU is uppercase
    if (data.sku) {
      data.sku = data.sku.toUpperCase();
    }

    // Clean data
    const updateData: any = {
      name: data.name.trim(),
      sku: data.sku,
      category: data.category.trim(),
      price: parseFloat(data.price),
      costPrice: parseFloat(data.costPrice),
      stock: parseInt(data.stock) || 0,
      minStockLevel: parseInt(data.minStockLevel) || 10,
      unit: data.unit || "piece",
      isActive: data.isActive !== undefined ? data.isActive : true,
      isFeatured: data.isFeatured || false,
      updatedBy: user.userId
    };

    // ✅ FIXED: Handle optional numeric fields properly
    // For mrp
    if (data.mrp !== undefined && data.mrp !== null && data.mrp !== "") {
      const mrpValue = parseFloat(data.mrp);
      if (!isNaN(mrpValue)) {
        updateData.mrp = mrpValue;
      }
    }
    
    // For discount
    if (data.discount !== undefined && data.discount !== null && data.discount !== "") {
      const discountValue = parseFloat(data.discount);
      if (!isNaN(discountValue)) {
        updateData.discount = discountValue;
      }
    }
    
    // For taxRate
    if (data.taxRate !== undefined && data.taxRate !== null && data.taxRate !== "") {
      const taxRateValue = parseFloat(data.taxRate);
      if (!isNaN(taxRateValue)) {
        updateData.taxRate = taxRateValue;
      }
    }
    
    // For maxStockLevel
    if (data.maxStockLevel !== undefined && data.maxStockLevel !== null && data.maxStockLevel !== "") {
      const maxStockValue = parseInt(data.maxStockLevel);
      if (!isNaN(maxStockValue)) {
        updateData.maxStockLevel = maxStockValue;
      }
    }
    
    // For weight
    if (data.weight !== undefined && data.weight !== null && data.weight !== "") {
      const weightValue = parseFloat(data.weight);
      if (!isNaN(weightValue)) {
        updateData.weight = weightValue;
      }
    }
    
    // For reorderLevel
    if (data.reorderLevel !== undefined && data.reorderLevel !== null && data.reorderLevel !== "") {
      const reorderValue = parseInt(data.reorderLevel);
      if (!isNaN(reorderValue)) {
        updateData.reorderLevel = reorderValue;
      }
    }

    // ✅ FIXED: Handle string fields
    if (data.subcategory !== undefined) updateData.subcategory = data.subcategory.trim();
    if (data.brand !== undefined) updateData.brand = data.brand.trim();
    if (data.barcode !== undefined) updateData.barcode = data.barcode.trim();
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.image !== undefined) updateData.image = data.image;
    if (data.images !== undefined) updateData.images = data.images;
    
    // ✅ FIXED: Handle dimensions properly
    if (data.dimensions) {
      const dimensions: any = {};
      
      if (data.dimensions.length !== undefined && data.dimensions.length !== null && data.dimensions.length !== "") {
        const lengthValue = parseFloat(data.dimensions.length);
        if (!isNaN(lengthValue)) dimensions.length = lengthValue;
      }
      
      if (data.dimensions.width !== undefined && data.dimensions.width !== null && data.dimensions.width !== "") {
        const widthValue = parseFloat(data.dimensions.width);
        if (!isNaN(widthValue)) dimensions.width = widthValue;
      }
      
      if (data.dimensions.height !== undefined && data.dimensions.height !== null && data.dimensions.height !== "") {
        const heightValue = parseFloat(data.dimensions.height);
        if (!isNaN(heightValue)) dimensions.height = heightValue;
      }
      
      // Only add dimensions if at least one property exists
      if (Object.keys(dimensions).length > 0) {
        updateData.dimensions = dimensions;
      }
    }
    
    // ✅ FIXED: Handle supplier properly
    if (data.supplier) {
      const supplier: any = {};
      
      if (data.supplier.name !== undefined) supplier.name = data.supplier.name.trim();
      if (data.supplier.contact !== undefined) supplier.contact = data.supplier.contact.trim();
      if (data.supplier.email !== undefined) supplier.email = data.supplier.email.trim();
      
      // Only add supplier if at least one property exists
      if (Object.keys(supplier).length > 0) {
        updateData.supplier = supplier;
      }
    }

    console.log("🟢 Update data:", JSON.stringify(updateData, null, 2));

    // Update product
    const product = await Product.findOneAndUpdate(
      { 
        _id: productId,
        storeId: user.userId 
      },
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found or access denied" },
        { status: 404 }
      );
    }

    console.log("🟢 Product updated successfully:", product._id);

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product
    });

  } catch (error: any) {
    console.error("🔴 Error updating product:", error);
    console.error("🔴 Error stack:", error.stack);
    
    let message = "Failed to update product";
    let status = 500;

    if (error.code === 11000) {
      message = "SKU already exists. Please use a different SKU.";
      status = 409;
    } else if (error.name === "ValidationError") {
      console.error("🔴 Validation errors:", error.errors);
      message = Object.values(error.errors).map((err: any) => err.message).join(", ");
      status = 400;
    } else if (error.message.includes("Cast to Number failed")) {
      message = "Invalid number value provided. Please check numeric fields.";
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

// DELETE - Delete single product
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await Product.findOneAndDelete({
      _id: productId,
      storeId: user.userId
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  }
}