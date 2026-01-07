import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getUserFromRequest } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = getUserFromRequest(req);

    // 🔐 Only OWNER allowed
    if (user.role !== "owner") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const storeId = user.userId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6);
    last7Days.setHours(0, 0, 0, 0);

    /* ===============================
       📊 BASIC COUNTS
    =============================== */

    const [
      totalOrders,
      totalProducts,
      pendingOrders,
      confirmedOrders,
      deliveredOrders
    ] = await Promise.all([
      Order.countDocuments({ storeId }),
      Product.countDocuments({ storeId }),
      Order.countDocuments({ storeId, status: "pending" }),
      Order.countDocuments({ storeId, status: "confirmed" }),
      Order.countDocuments({ storeId, status: "delivered" })
    ]);

    /* ===============================
       💰 REVENUE
    =============================== */

    const revenueAgg = await Order.aggregate([
      {
        $match: {
          storeId,
          status: { $in: ["confirmed", "delivered"] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    const todayRevenueAgg = await Order.aggregate([
      {
        $match: {
          storeId,
          status: { $in: ["confirmed", "delivered"] },
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    const todayRevenue = todayRevenueAgg[0]?.total || 0;

    /* ===============================
       📉 LOW STOCK PRODUCTS
    =============================== */

    const lowStockProducts = await Product.find({
      storeId,
      stock: { $lte: mongoose.Types.Decimal128 ? undefined : 10 }
    })
      .sort({ stock: 1 })
      .limit(10)
      .lean();

    /* ===============================
       📈 LAST 7 DAYS ORDERS & REVENUE
    =============================== */

    const last7DaysStats = await Order.aggregate([
      {
        $match: {
          storeId,
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    /* ===============================
       📦 RECENT ORDERS
    =============================== */

    const recentOrders = await Order.find({ storeId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("orderId totalAmount status payment createdAt")
      .lean();

    /* ===============================
       ✅ RESPONSE
    =============================== */

    return NextResponse.json({
      success: true,
      dashboard: {
        stats: {
          totalOrders,
          totalProducts,
          pendingOrders,
          confirmedOrders,
          deliveredOrders,
          totalRevenue,
          todayRevenue
        },
        charts: {
          last7Days: last7DaysStats
        },
        recentOrders,
        lowStockProducts
      }
    });

  } catch (error: any) {
    console.error("❌ Owner dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to load dashboard"
      },
      { status: error.statusCode || 500 }
    );
  }
}
