import mongoose, { Schema, models } from "mongoose";

const WishlistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  { 
    timestamps: true 
  }
);

// Ensure user can't add same product to wishlist multiple times
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default models.Wishlist || mongoose.model("Wishlist", WishlistSchema);