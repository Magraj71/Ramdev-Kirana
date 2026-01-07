"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar"
import Link from "next/link";
import {
  TrendingUp,
  Package,
  Users,
  ShoppingBag,
  DollarSign,
  Activity,
  BarChart3,
  Bell,
  Search,
  Download,
  Filter,
  MoreVertical,
  ChevronRight,
  Calendar,
  RefreshCw,
  Plus,
  Edit,
  Store,
  CreditCard,
  Truck,
  Star,
  AlertCircle,
  Loader2,
  X,
  CheckCircle,
  Clock,
  Eye,
  AlertTriangle
} from "lucide-react"
import { format } from "date-fns";

// Types for dashboard data
interface DashboardData {
  stats: {
    totalOrders: number;
    totalProducts: number;
    pendingOrders: number;
    confirmedOrders: number;
    deliveredOrders: number;
    totalRevenue: number;
    todayRevenue: number;
  };
  charts: {
    last7Days: Array<{
      _id: string;
      orders: number;
      revenue: number;
    }>;
  };
  recentOrders: Array<{
    _id: string;
    orderId: string;
    totalAmount: number;
    status: "pending" | "confirmed" | "delivered" | "cancelled";
    payment: string;
    createdAt: string;
    customerName?: string;
  }>;
  lowStockProducts: Array<{
    _id: string;
    name: string;
    stock: number;
    category?: string;
    minStock?: number;
    image?: string;
  }>;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  dashboard: DashboardData;
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);
      if (!refreshing) setLoading(true);

      const res = await fetch("/api/dashboard/owner", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Access denied. Owner privileges required.");
        }
        throw new Error("Failed to fetch dashboard data");
      }

      const data: ApiResponse = await res.json();
      if (data.success && data.dashboard) {
        setDashboardData(data.dashboard);
      } else {
        throw new Error(data.message || "Invalid response format");
      }
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffHours < 24) {
        if (diffHours < 1) {
          const diffMinutes = Math.floor(diffMs / (1000 * 60));
          return `${diffMinutes}m ago`;
        }
        return `${diffHours}h ago`;
      }
      return format(date, 'MMM dd, hh:mm a');
    } catch (error) {
      return "Recently";
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle };
      case 'confirmed': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle };
      case 'pending': return { bg: 'bg-orange-100', text: 'text-orange-700', icon: Clock };
      case 'cancelled': return { bg: 'bg-red-100', text: 'text-red-700', icon: X };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock };
    }
  };

  // Get payment method color
  const getPaymentColor = (payment: unknown) => {
    const value = String(payment ?? "").toLowerCase();

    switch (value) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cod":
        return "bg-blue-100 text-blue-700";
      case "online":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };



  // Get stock level color
  const getStockColor = (stock: number) => {
    if (stock <= 3) return 'bg-red-100 text-red-700';
    if (stock <= 10) return 'bg-orange-100 text-orange-700';
    return 'bg-emerald-100 text-emerald-700';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
        <Navbar />
        <main className="p-4 md:p-6 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
        <Navbar />
        <main className="p-4 md:p-6 flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Dashboard</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Calculate chart max height
  const maxRevenue = dashboardData?.charts.last7Days.reduce((max, day) =>
    Math.max(max, day.revenue), 0) || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <Navbar />

      <main className="p-4 md:p-6">
        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess("")} className="hover:bg-emerald-100 p-1 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="hover:bg-red-100 p-1 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Store Dashboard</h1>
            <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2">
              <div className="flex items-center text-sm text-gray-600">
                <Store className="w-4 h-4 mr-1" />
                <span>Ramdev Enterprises Store • Cherai, Jodhpur, Rajasthan</span>
              </div>
              <span className="hidden md:inline text-gray-400">•</span>
              <span className="text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full inline-flex items-center w-fit">
                <Activity className="w-3 h-3 inline mr-1" />
                Store Open
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders, products..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full md:w-64"
              />
            </div>
            <button className="p-2 hover:bg-white rounded-xl border border-gray-200 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Today's Revenue */}
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-4 md:p-6 shadow-sm border border-emerald-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">
                  {dashboardData ? formatCurrency(dashboardData.stats.todayRevenue) : "₹0"}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    Real-time data
                  </span>
                </div>
              </div>
              <div className="p-2 md:p-3 bg-emerald-100 rounded-xl">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-4 md:p-6 shadow-sm border border-blue-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">
                  {dashboardData?.stats.totalOrders || 0}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {dashboardData?.stats.pendingOrders || 0} pending
                  </span>
                </div>
              </div>
              <div className="p-2 md:p-3 bg-blue-100 rounded-xl">
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-4 md:p-6 shadow-sm border border-orange-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">
                  {dashboardData?.stats.totalProducts || 0}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                    <Package className="w-3 h-3 inline mr-1" />
                    {dashboardData?.lowStockProducts?.length || 0} low stock
                  </span>
                </div>
              </div>
              <div className="p-2 md:p-3 bg-orange-100 rounded-xl">
                <Package className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Delivered Orders */}
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-4 md:p-6 shadow-sm border border-purple-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered Orders</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">
                  {dashboardData?.stats.deliveredOrders || 0}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    <Truck className="w-3 h-3 inline mr-1" />
                    {dashboardData?.stats.confirmedOrders || 0} confirmed
                  </span>
                </div>
              </div>
              <div className="p-2 md:p-3 bg-purple-100 rounded-xl">
                <Truck className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
              <div className="mb-4 sm:mb-0">
                <h3 className="text-lg font-semibold text-gray-800">Revenue Overview</h3>
                <p className="text-sm text-gray-600">Last 7 days performance</p>
              </div>
              <div className="text-right">
                <p className="text-xl md:text-2xl font-bold text-gray-800">
                  {dashboardData ? formatCurrency(dashboardData.stats.totalRevenue) : "₹0"}
                </p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>

            {/* Simple Bar Chart */}
            <div className="h-48 md:h-64 flex items-end justify-between gap-1 md:gap-2 mt-8">
              {dashboardData?.charts.last7Days.length ? (
                dashboardData.charts.last7Days.map((day, index) => (
                  <div key={day._id} className="flex flex-col items-center flex-1">
                    <div className="text-xs text-gray-500 mb-2">
                      {format(new Date(day._id), 'EEE')}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all hover:opacity-90"
                      style={{
                        height: `${Math.max(10, (day.revenue / maxRevenue) * 100)}%`
                      }}
                    />
                    <div className="mt-2 text-center">
                      <p className="text-xs md:text-sm font-medium">{day.orders}</p>
                      <p className="text-xs text-gray-500 hidden md:block">orders</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  No data for last 7 days
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-lg md:text-xl font-bold text-gray-800">
                  {dashboardData?.stats.totalOrders ?
                    formatCurrency(dashboardData.stats.totalRevenue / dashboardData.stats.totalOrders) :
                    "₹0"
                  }
                </p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Orders Today</p>
                <p className="text-lg md:text-xl font-bold text-gray-800">
                  {dashboardData?.charts.last7Days.find(day =>
                    format(new Date(day._id), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  )?.orders || 0}
                </p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-lg md:text-xl font-bold text-gray-800">
                  {dashboardData?.stats.totalOrders ?
                    `${Math.round((dashboardData.stats.deliveredOrders / dashboardData.stats.totalOrders) * 100)}%` :
                    "0%"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Quick Insights</h3>

            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between p-3 md:p-4 bg-emerald-50 rounded-xl">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-100 rounded-lg mr-2 md:mr-3">
                    <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm md:text-base truncate">Total Revenue</p>
                    <p className="text-xs md:text-sm text-gray-600 truncate">All confirmed orders</p>
                  </div>
                </div>
                <span className="text-emerald-600 font-bold text-sm md:text-base ml-2">
                  {dashboardData ? formatCurrency(dashboardData.stats.totalRevenue) : "₹0"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 md:p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-2 md:mr-3">
                    <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm md:text-base truncate">Pending Orders</p>
                    <p className="text-xs md:text-sm text-gray-600 truncate">Need confirmation</p>
                  </div>
                </div>
                <span className="text-blue-600 font-bold text-sm md:text-base ml-2">
                  {dashboardData?.stats.pendingOrders || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 md:p-4 bg-orange-50 rounded-xl">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg mr-2 md:mr-3">
                    <Package className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm md:text-base truncate">Low Stock Items</p>
                    <p className="text-xs md:text-sm text-gray-600 truncate">Need restocking</p>
                  </div>
                </div>
                <span className="text-orange-600 font-bold text-sm md:text-base ml-2">
                  {dashboardData?.lowStockProducts?.length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 md:p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-2 md:mr-3">
                    <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm md:text-base truncate">Order Completion</p>
                    <p className="text-xs md:text-sm text-gray-600 truncate">Delivered rate</p>
                  </div>
                </div>
                <span className="text-purple-600 font-bold text-sm md:text-base ml-2">
                  {dashboardData?.stats.totalOrders ?
                    `${Math.round((dashboardData.stats.deliveredOrders / dashboardData.stats.totalOrders) * 100)}%` :
                    "0%"
                  }
                </span>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-2 md:py-3 rounded-xl transition-all disabled:opacity-50 text-sm md:text-base"
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh Dashboard
            </button>
          </div>
        </div>

        {/* Recent Orders & Low Stock Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-4 md:p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
                <Link href="/orders" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="p-4 md:p-6">
              {dashboardData?.recentOrders?.length ? (
                <div className="space-y-3 md:space-y-4">
                  {dashboardData.recentOrders.map((order) => {
                    const statusConfig = getStatusColor(order.status);
                    const StatusIcon = statusConfig.icon;

                    // Handle payment object
                    const paymentStatus = typeof order.payment === "string"
                      ? order.payment
                      : order.payment?.status ?? "pending";

                    return (
                      <div key={order._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                        <div className="flex items-start sm:items-center gap-3 mb-2 sm:mb-0">
                          <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                            <StatusIcon className={`w-4 h-4 md:w-5 md:h-5 ${statusConfig.text}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 text-sm md:text-base truncate">{order.orderId}</p>
                            <div className="flex items-center flex-wrap gap-1 md:gap-2 mt-1">
                              <span className="text-xs text-gray-600">
                                {formatDate(order.createdAt)}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                                {order.status}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getPaymentColor(paymentStatus)}`}>
                                {paymentStatus}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="font-bold text-gray-800 text-base md:text-lg">
                            {formatCurrency(order.totalAmount)}
                          </p>
                          <button className="mt-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}

                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent orders</p>
                </div>
              )}

              <Link href="/orders/new">
                <button className="w-full mt-4 md:mt-6 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-emerald-300 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 font-medium py-2 md:py-3 rounded-xl transition-all text-sm md:text-base">
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  Create New Order
                </button>
              </Link>
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-4 md:p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Low Stock Alert</h3>
                <span className="text-sm text-red-600 bg-red-50 px-2 md:px-3 py-1 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {dashboardData?.lowStockProducts?.length || 0} items
                </span>
              </div>
            </div>

            <div className="p-4 md:p-6">
              {dashboardData?.lowStockProducts?.length ? (
                <div className="space-y-3 md:space-y-4">
                  {dashboardData.lowStockProducts.map((product) => (
                    <div key={product._id} className="flex items-center justify-between p-3 md:p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 text-sm md:text-base truncate">{product.name}</p>
                          <p className="text-xs text-gray-600 truncate">{product.category || "General"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm md:text-base ${getStockColor(product.stock)} px-2 py-1 rounded-full`}>
                          {product.stock} units
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Min: {product.minStock || 10}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">All products are well-stocked</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-6">
                <Link href="/products" className="flex-1">
                  <button className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-2 md:py-3 rounded-xl transition-colors text-sm md:text-base">
                    <Edit className="w-4 h-4" />
                    Manage Products
                  </button>
                </Link>
                <Link href="/products/new" className="flex-1">
                  <button className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium py-2 md:py-3 rounded-xl transition-colors text-sm md:text-base">
                    <Plus className="w-4 h-4" />
                    Add New Product
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 md:mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Link href="/orders/new" className="block">
            <button className="w-full bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center transition-all group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-2 md:mb-3 group-hover:bg-emerald-200 transition-colors">
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
              </div>
              <span className="font-medium text-gray-700 text-sm md:text-base">New Sale</span>
            </button>
          </Link>

          <Link href="/products/new" className="block">
            <button className="w-full bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center transition-all group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-2 md:mb-3 group-hover:bg-blue-200 transition-colors">
                <Package className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <span className="font-medium text-gray-700 text-sm md:text-base">Add Product</span>
            </button>
          </Link>

          <Link href="/customers/new" className="block">
            <button className="w-full bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center transition-all group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-2 md:mb-3 group-hover:bg-orange-200 transition-colors">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
              </div>
              <span className="font-medium text-gray-700 text-sm md:text-base">Add Customer</span>
            </button>
          </Link>

          <Link href="/reports" className="block">
            <button className="w-full bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center transition-all group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-2 md:mb-3 group-hover:bg-purple-200 transition-colors">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
              <span className="font-medium text-gray-700 text-sm md:text-base">Reports</span>
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}