import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  // Store reference
  storeId: {
    type: String,
    required: true,
    index: true
  },

  // Basic information
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  barcode: {
    type: String,
    trim: true
  },

  // Category and classification
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },

  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0
  },
  mrp: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // Inventory
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minStockLevel: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  maxStockLevel: {
    type: Number,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ["kg", "g", "l", "ml", "piece", "pack", "dozen", "bottle", "box", "packet"],
    default: "piece"
  },

  // Product details
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String
  },
  images: [{
    type: String
  }],
  weight: {
    type: Number
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },

  // Flags and status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },

  // Supplier information
  supplier: {
    name: String,
    contact: String,
    email: String
  },
  reorderLevel: {
    type: Number,
    default: 5
  },

  // Audit fields
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ storeId: 1, category: 1 });
productSchema.index({ storeId: 1, sku: 1 }, { unique: true });
productSchema.index({ storeId: 1, name: "text", description: "text" });

// Virtual for margin calculation
productSchema.virtual("margin").get(function() {
  if (this.costPrice === 0) return 0;
  return ((this.price - this.costPrice) / this.costPrice) * 100;
});

// Virtual for margin amount
productSchema.virtual("marginAmount").get(function() {
  return this.price - this.costPrice;
});

// Virtual for stock status
productSchema.virtual("stockStatus").get(function() {
  if (this.stock === 0) return "out_of_stock";
  if (this.stock < this.minStockLevel) return "low_stock";
  return "in_stock";
});

// ✅ FIXED: Simple pre-save hook (no next parameter)
productSchema.pre("save", function() {
  if (this.sku) {
    this.sku = this.sku.toUpperCase();
  }
});

export default mongoose.models.Product || mongoose.model("Product", productSchema);