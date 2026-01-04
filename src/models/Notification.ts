// src/models/Notification.ts
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["info", "success", "warning", "error"],
    default: "info"
  },
  link: String, // URL to navigate on click
  metadata: mongoose.Schema.Types.Mixed, // Additional data
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);