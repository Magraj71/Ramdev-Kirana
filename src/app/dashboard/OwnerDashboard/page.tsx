"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
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
  AlertTriangle,
  Menu,
  Home,
  BarChart
} from "lucide-react";
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
    payment: any;
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
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
      return format(date, "MMM dd, hh:mm a");
    } catch (error) {
      return "Recently";
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle };
      case "confirmed":
        return { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle };
      case "pending":
        return { bg: "bg-orange-100", text: "text-orange-700", icon: Clock };
      case "cancelled":
        return { bg: "bg-red-100", text: "text-red-700", icon: X };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", icon: Clock };
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
    if (stock <= 3) return "bg-red-100 text-red-700";
    if (stock <= 10) return "bg-orange-100 text-orange-700";
    return "bg-emerald-100 text-emerald-700";
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
        <Navbar />
        <main className="p-4 flex items-center justify-center min-h-[80vh]">
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
        <main className="p-4 flex items-center justify-center min-h-[80vh]">
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
  const maxRevenue = dashboardData?.charts.last7Days.reduce((max, day) => Math.max(max, day.revenue), 0) || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <Navbar />

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${isSidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">Dashboard</span>
                  <p className="text-xs text-gray-600 -mt-1">Owner Panel</p>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-lg">
                <Home className="w-5 h-5" />
                <span className="font-medium">Overview</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg">
                <ShoppingBag className="w-5 h-5" />
                <span className="font-medium">Orders</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg">
                <Package className="w-5 h-5" />
                <span className="font-medium">Products</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg">
                <Users className="w-5 h-5" />
                <span className="font-medium">Customers</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg">
                <BarChart className="w-5 h-5" />
                <span className="font-medium">Reports</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      <main className="pt-4 px-3 sm:px-4 md:px-6 pb-6">
        {/* Mobile Header */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white rounded-xl">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-white rounded-xl disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Ramdev Enterprises • Cherai, Jodhpur
          </p>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Store Dashboard</h1>
            <div className="flex flex-col md:flex-row md:items-center gap-2 mt-1">
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
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full md:w-64 text-sm"
              />
            </div>
            <button className="p-2 hover:bg-white rounded-xl border border-gray-200 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50 text-sm"
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

        {/* Success Alert */}
        {success && (
          <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess("")} className="hover:bg-emerald-100 p-1 rounded">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="hover:bg-red-100 p-1 rounded">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Stats Grid - Optimized for mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Today's Revenue */}
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-emerald-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mt-1 sm:mt-2">
                  {dashboardData ? formatCurrency(dashboardData.stats.todayRevenue) : "₹0"}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                    <TrendingUp className="w-2.5 h-2.5 inline mr-0.5" />
                    Live
                  </span>
                </div>
              </div>
              <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-blue-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mt-1 sm:mt-2">
                  {dashboardData?.stats.totalOrders || 0}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                    {dashboardData?.stats.pendingOrders || 0} pending
                  </span>
                </div>
              </div>
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-orange-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mt-1 sm:mt-2">
                  {dashboardData?.stats.totalProducts || 0}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">
                    <Package className="w-2.5 h-2.5 inline mr-0.5" />
                    {dashboardData?.lowStockProducts?.length || 0} low
                  </span>
                </div>
              </div>
              <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Delivered Orders */}
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-purple-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mt-1 sm:mt-2">
                  {dashboardData?.stats.deliveredOrders || 0}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">
                    <Truck className="w-2.5 h-2.5 inline mr-0.5" />
                    {dashboardData?.stats.confirmedOrders || 0} conf.
                  </span>
                </div>
              </div>
              <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
              <div className="mb-3 sm:mb-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Revenue Overview</h3>
                <p className="text-xs sm:text-sm text-gray-600">Last 7 days</p>
              </div>
              <div className="text-right">
                <p className="text-lg sm:text-xl font-bold text-gray-800">
                  {dashboardData ? formatCurrency(dashboardData.stats.totalRevenue) : "₹0"}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>

            {/* Simple Bar Chart - Mobile Optimized */}
            <div className="h-40 sm:h-48 md:h-56 lg:h-48 xl:h-56 flex items-end justify-between gap-1 sm:gap-2 mt-6 overflow-x-auto">
              {dashboardData?.charts.last7Days.length ? (
                dashboardData.charts.last7Days.map((day, index) => (
                  <div key={day._id} className="flex flex-col items-center flex-1 min-w-[40px] sm:min-w-[50px]">
                    <div className="text-xs text-gray-500 mb-2 text-center">
                      {format(new Date(day._id), "EEE")}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all hover:opacity-90"
                      style={{
                        height: `${Math.max(15, (day.revenue / maxRevenue) * 100)}%`,
                      }}
                    />
                    <div className="mt-2 text-center">
                      <p className="text-xs font-medium">{day.orders}</p>
                      <p className="text-xs text-gray-500 hidden sm:block">orders</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                  No data for last 7 days
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600">Avg Order</p>
                <p className="text-base sm:text-lg font-bold text-gray-800">
                  {dashboardData?.stats.totalOrders
                    ? formatCurrency(dashboardData.stats.totalRevenue / dashboardData.stats.totalOrders)
                    : "₹0"}
                </p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600">Today Orders</p>
                <p className="text-base sm:text-lg font-bold text-gray-800">
                  {dashboardData?.charts.last7Days.find(
                    (day) =>
                      format(new Date(day._id), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                  )?.orders || 0}
                </p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600">Completion</p>
                <p className="text-base sm:text-lg font-bold text-gray-800">
                  {dashboardData?.stats.totalOrders
                    ? `${Math.round((dashboardData.stats.deliveredOrders / dashboardData.stats.totalOrders) * 100)}%`
                    : "0%"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Quick Insights</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                <div className="flex items-center">
                  <div className="p-1.5 bg-emerald-100 rounded-lg mr-2">
                    <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">Total Revenue</p>
                    <p className="text-xs text-gray-600 truncate">Confirmed orders</p>
                  </div>
                </div>
                <span className="text-emerald-600 font-bold text-xs sm:text-sm ml-2">
                  {dashboardData ? formatCurrency(dashboardData.stats.totalRevenue) : "₹0"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center">
                  <div className="p-1.5 bg-blue-100 rounded-lg mr-2">
                    <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">Pending Orders</p>
                    <p className="text-xs text-gray-600 truncate">Need confirmation</p>
                  </div>
                </div>
                <span className="text-blue-600 font-bold text-xs sm:text-sm ml-2">
                  {dashboardData?.stats.pendingOrders || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                <div className="flex items-center">
                  <div className="p-1.5 bg-orange-100 rounded-lg mr-2">
                    <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">Low Stock</p>
                    <p className="text-xs text-gray-600 truncate">Need restocking</p>
                  </div>
                </div>
                <span className="text-orange-600 font-bold text-xs sm:text-sm ml-2">
                  {dashboardData?.lowStockProducts?.length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                <div className="flex items-center">
                  <div className="p-1.5 bg-purple-100 rounded-lg mr-2">
                    <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">Delivered Rate</p>
                    <p className="text-xs text-gray-600 truncate">Order completion</p>
                  </div>
                </div>
                <span className="text-purple-600 font-bold text-xs sm:text-sm ml-2">
                  {dashboardData?.stats.totalOrders
                    ? `${Math.round((dashboardData.stats.deliveredOrders / dashboardData.stats.totalOrders) * 100)}%`
                    : "0%"}
                </span>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-2.5 rounded-xl transition-all disabled:opacity-50 text-sm"
            >
              {refreshing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Refresh Dashboard
            </button>
          </div>
        </div>

        {/* Recent Orders & Low Stock Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Recent Orders</h3>
                <Link
                  href="/orders"
                  className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </div>
            </div>

            <div className="p-4">
              {dashboardData?.recentOrders?.length ? (
                <div className="space-y-3">
                  {dashboardData.recentOrders.map((order) => {
                    const statusConfig = getStatusColor(order.status);
                    const StatusIcon = statusConfig.icon;

                    const paymentStatus = typeof order.payment === "string"
                      ? order.payment
                      : order.payment?.status ?? "pending";

                    return (
                      <div
                        key={order._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100"
                      >
                        <div className="flex items-start sm:items-center gap-3 mb-2 sm:mb-0">
                          <div className={`p-1.5 sm:p-2 rounded-lg ${statusConfig.bg}`}>
                            <StatusIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${statusConfig.text}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">{order.orderId}</p>
                            <div className="flex items-center flex-wrap gap-1 mt-1">
                              <span className="text-xs text-gray-600">{formatDate(order.createdAt)}</span>
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.text}`}
                              >
                                {order.status}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${getPaymentColor(paymentStatus)}`}>
                                {paymentStatus}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="font-bold text-gray-800 text-sm sm:text-base">
                            {formatCurrency(order.totalAmount)}
                          </p>
                          <Link
                            href={`/orders/${order.orderId}`}
                            className="mt-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No recent orders</p>
                </div>
              )}

              <Link href="/orders/new">
                <button className="w-full mt-4 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-emerald-300 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 font-medium py-2.5 rounded-xl transition-all text-sm">
                  <Plus className="w-4 h-4" />
                  Create New Order
                </button>
              </Link>
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Low Stock Alert</h3>
                <span className="text-xs sm:text-sm text-red-600 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {dashboardData?.lowStockProducts?.length || 0}
                </span>
              </div>
            </div>

            <div className="p-4">
              {dashboardData?.lowStockProducts?.length ? (
                <div className="space-y-3">
                  {dashboardData.lowStockProducts.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">{product.name}</p>
                          <p className="text-xs text-gray-600 truncate">{product.category || "General"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold text-xs sm:text-sm ${getStockColor(product.stock)} px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full`}
                        >
                          {product.stock}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">Min: {product.minStock || 10}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">All products well-stocked</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                <Link href="/products" className="flex-1">
                  <button className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-2.5 rounded-xl transition-colors text-sm">
                    <Edit className="w-3.5 h-3.5" />
                    Manage Products
                  </button>
                </Link>
                <Link href="/products/new" className="flex-1">
                  <button className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium py-2.5 rounded-xl transition-colors text-sm">
                    <Plus className="w-3.5 h-3.5" />
                    Add Product
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Quick Actions */}
        <div className="lg:hidden mt-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/orders/new">
                <button className="w-full bg-emerald-50 hover:bg-emerald-100 rounded-xl p-3 flex flex-col items-center justify-center transition-all">
                  <ShoppingBag className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="text-xs font-medium text-gray-700">New Sale</span>
                </button>
              </Link>
              <Link href="/products/new">
                <button className="w-full bg-blue-50 hover:bg-blue-100 rounded-xl p-3 flex flex-col items-center justify-center transition-all">
                  <Package className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-xs font-medium text-gray-700">Add Product</span>
                </button>
              </Link>
              <Link href="/customers/new">
                <button className="w-full bg-orange-50 hover:bg-orange-100 rounded-xl p-3 flex flex-col items-center justify-center transition-all">
                  <Users className="w-5 h-5 text-orange-600 mb-1" />
                  <span className="text-xs font-medium text-gray-700">Add Customer</span>
                </button>
              </Link>
              <Link href="/reports">
                <button className="w-full bg-purple-50 hover:bg-purple-100 rounded-xl p-3 flex flex-col items-center justify-center transition-all">
                  <BarChart3 className="w-5 h-5 text-purple-600 mb-1" />
                  <span className="text-xs font-medium text-gray-700">Reports</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Footer Actions */}
        <div className="hidden lg:grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
          <Link href="/orders/new" className="block">
            <button className="w-full bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center transition-all group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-1.5 sm:mb-2 group-hover:bg-emerald-200 transition-colors">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              <span className="font-medium text-gray-700 text-xs sm:text-sm">New Sale</span>
            </button>
          </Link>

          <Link href="/products/new" className="block">
            <button className="w-full bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center transition-all group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-1.5 sm:mb-2 group-hover:bg-blue-200 transition-colors">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-700 text-xs sm:text-sm">Add Product</span>
            </button>
          </Link>

          <Link href="/customers/new" className="block">
            <button className="w-full bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center transition-all group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-1.5 sm:mb-2 group-hover:bg-orange-200 transition-colors">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <span className="font-medium text-gray-700 text-xs sm:text-sm">Add Customer</span>
            </button>
          </Link>

          <Link href="/reports" className="block">
            <button className="w-full bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center transition-all group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-1.5 sm:mb-2 group-hover:bg-purple-200 transition-colors">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <span className="font-medium text-gray-700 text-xs sm:text-sm">Reports</span>
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}