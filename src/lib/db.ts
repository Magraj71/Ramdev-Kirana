import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  await mongoose.connect(MONGO_URI);
};

// Export as default
export default connectDB;

// Also export as named for backward compatibility
export { connectDB };
