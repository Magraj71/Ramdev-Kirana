// models/Order.ts
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  // Order identification
  orderId: {
    type: String,
    unique: true,
    // required: true
  },
   orderNumber: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values if needed
    default: function() {
      // Generate unique order number
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      return `ON-${timestamp}-${random}`;
    }
  },
  
  // Customer information
  customer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: { type: String }
    }
  },
  
  // Store reference
  storeId: {
    type: String,
    required: true,
    index: true
  },
  
  // Products in order
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      // required: true
    },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0 },
    unit: { type: String, required: true },
    image: { type: String }
  }],
  
  // Pricing details
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  shippingCharge: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Payment information
  payment: {
    method: {
      type: String,
      enum: ["cod", "online", "card", "upi"],
      default: "cod"
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending"
    },
    transactionId: { type: String },
    paidAmount: { type: Number, default: 0 }
  },
  
  // Order status
  status: {
    type: String,
    enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"],
    default: "pending",
    index: true
  },
  
  // Delivery information
  delivery: {
    expectedDate: { type: Date },
    deliveredDate: { type: Date },
    trackingNumber: { type: String },
    deliveryAgent: { type: String }
  },
  
  // Notes
  notes: {
    type: String,
    trim: true
  },
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// // Generate order ID before saving
orderSchema.pre("save", async function () {
  if (this.orderId) return;

  const date = new Date();
  const prefix = "ORD";
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const count = await mongoose.model("Order").countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });

  const serial = (count + 1).toString().padStart(4, "0");
  this.orderId = `${prefix}${year}${month}${day}${serial}`;
});



// Indexes
orderSchema.index({ storeId: 1, createdAt: -1 });
orderSchema.index({ "customer.email": 1 });
orderSchema.index({ "customer.phone": 1 });
orderSchema.index({ orderId: 1 }, { unique: true });

// orderSchema.index({ storeId: 1, createdAt: -1 });
orderSchema.index({ "customer.email": 1, storeId: 1 }); // User ke liye
orderSchema.index({ createdBy: 1, storeId: 1 }); // CreatedBy user ke liye

// Virtuals
orderSchema.virtual("itemCount").get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

orderSchema.virtual("statusHistory").get(function() {
  return [
    { status: "pending", date: this.createdAt },
    { status: this.status, date: this.updatedAt }
  ];
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema);