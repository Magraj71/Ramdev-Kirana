"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  ShoppingBag,
  Heart,
  User,
  Package,
  Clock,
  CheckCircle,
  DollarSign,
  MapPin,
  CreditCard,
  Shield,
  Gift,
  Star,
  ChevronRight,
  ShoppingCart,
  Plus,
  Award,
  Calendar,
  Crown,
  TrendingUp,
  RefreshCw,
  Settings,
  LogOut,
  Bell,
  MessageSquare,
  HelpCircle,
  Truck,
  Loader2,
  AlertCircle,
  Trash2,
  X,
  Check,
  ExternalLink,
  Grid,
  Menu,
  Home,
  Search,
  MoreVertical,
  Filter
} from "lucide-react";

// Interfaces
interface UserStats {
  name: string;
  email: string;
  phone: string;
  location: string;
  membership: string;
  joinDate: string;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: string;
  loyaltyPoints: number;
  monthlyOrders: number;
  averageOrderValue: string;
  wishlistItems: number;
}

interface Order {
  id: string;
  date: string;
  items: number;
  amount: string;
  status: 'delivered' | 'processing' | 'pending' | 'confirmed';
  tracking: string;
  customer: string;
  paymentMethod?: string;
  expectedDelivery?: string;
}

interface WishlistItem {
  _id: string;
  name: string;
  price: string;
  category: string;
  image: string;
  productId: string;
  sku?: string;
  stock?: number;
}

interface DashboardResponse {
  success: boolean;
  stats: UserStats;
  recentOrders: Order[];
  wishlist: WishlistItem[];
  lastUpdated?: string;
}

export default function UserDashboard() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const router = useRouter();

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 768);
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);
      setRefreshing(true);

      const response = await axios.get<DashboardResponse>("/api/dashboard/user");

      if (response.data.success) {
        setUserStats(response.data.stats);
        setRecentOrders(response.data.recentOrders);
        setWishlistItems(response.data.wishlist);
      } else {
        throw new Error(response.data.message || "Failed to load dashboard");
      }

    } catch (err: any) {
      console.error("Dashboard data fetch error:", err);
      
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        setTimeout(() => router.push("/login"), 2000);
      } else if (err.response?.status === 404) {
        setError("User data not found. Please contact support.");
      } else {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      }
      
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Handle remove from wishlist
  const handleRemoveFromWishlist = async (itemId: string) => {
    try {
      const response = await axios.delete(`/api/user/wishlist/${itemId}`);
      
      if (response.data.success) {
        // Remove from local state
        setWishlistItems(prev => prev.filter(item => item._id !== itemId));
        
        // Update user stats
        setUserStats(prev => prev ? {
          ...prev,
          wishlistItems: Math.max(0, prev.wishlistItems - 1)
        } : null);
        
        // Show success message
        setSuccess("Removed from wishlist!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      console.error("Remove from wishlist error:", err);
      setError(err.response?.data?.message || "Failed to remove from wishlist");
    }
  };

  // Handle add to cart from wishlist
  const handleAddToCartFromWishlist = async (productId: string, itemId: string) => {
    try {
      const cartResponse = await axios.post("/api/cart/add", { 
        productId, 
        quantity: 1 
      });
      
      if (cartResponse.data.success) {
        // Remove from wishlist after adding to cart
        await handleRemoveFromWishlist(itemId);
        
        setSuccess("Added to cart!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error: any) {
      console.error("Add to cart from wishlist error:", error);
      setError(error.response?.data?.message || "Failed to add to cart");
    }
  };

  // Handle track order
  const handleTrackOrder = (trackingId: string) => {
    router.push(`/tracking/${trackingId}`);
  };

  // Handle view order details
  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  // Handle continue shopping
  const handleContinueShopping = () => {
    router.push("/products");
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setError("Failed to logout. Please try again.");
    }
  };

  // Get user initials
  const getUserInitials = () => {
    if (!userStats?.name) return "U";
    return userStats.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get status color and icon
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'delivered':
        return {
          color: 'bg-emerald-100 text-emerald-700',
          icon: CheckCircle,
          iconColor: 'text-emerald-600'
        };
      case 'processing':
      case 'confirmed':
        return {
          color: 'bg-blue-100 text-blue-700',
          icon: Package,
          iconColor: 'text-blue-600'
        };
      case 'pending':
        return {
          color: 'bg-orange-100 text-orange-700',
          icon: Clock,
          iconColor: 'text-orange-600'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-700',
          icon: Clock,
          iconColor: 'text-gray-600'
        };
    }
  };

  // Format date for display based on screen size
  const formatDate = (date: string) => {
    if (windowWidth < 640) {
      return date.split(' ')[0]; // Just the date part
    }
    return date;
  };

  // Truncate text based on screen size
  const truncateText = (text: string, maxLength: number) => {
    if (windowWidth < 768 && text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !userStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh] px-4">
          <div className="text-center max-w-md w-full p-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Dashboard</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={fetchDashboardData}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Navbar />
      
      <main className="px-3 sm:px-4 md:px-6 py-4 md:py-6">
        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex justify-between items-center animate-fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="text-sm sm:text-base">{success}</span>
            </div>
            <button onClick={() => setSuccess("")} className="hover:bg-emerald-100 p-1 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm sm:text-base">{error}</span>
            </div>
            <button onClick={() => setError("")} className="hover:bg-red-100 p-1 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header - Responsive */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
              {getUserInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">
                  Welcome back, {userStats?.name?.split(' ')[0] || "User"}!
                </h1>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-1 sm:p-2 hover:bg-white rounded-lg sm:rounded-xl border border-gray-200 transition-colors disabled:opacity-50"
                  title="Refresh dashboard"
                >
                  <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              {userStats && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="flex items-center text-xs sm:text-sm text-gray-600">
                    <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {userStats.membership}
                  </span>
                  <span className="hidden sm:inline text-gray-400">•</span>
                  <span className="flex items-center text-xs sm:text-sm text-gray-600">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {userStats.joinDate}
                  </span>
                  <span className="text-xs sm:text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                    <Crown className="w-3 h-3 inline mr-1" />
                    {userStats.loyaltyPoints} Points
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons - Responsive */}
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            {/* Mobile Action Menu */}
            {isMobile && (
              <div className="relative group">
                <button className="p-2 hover:bg-white rounded-xl border border-gray-200 transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-xl border border-gray-100 py-2 z-10 hidden group-hover:block">
                  <Link href="/notifications" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                    <Bell className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Notifications</span>
                  </Link>
                  <Link href="/settings" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                    <Settings className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Desktop Action Buttons */}
            {!isMobile && (
              <>
                <Link href="/notifications">
                  <button className="p-2 hover:bg-white rounded-xl border border-gray-200 transition-colors relative">
                    <Bell className="w-5 h-5 text-gray-600" />
                  </button>
                </Link>
                <Link href="/settings">
                  <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-xl transition-colors text-sm sm:text-base">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium px-3 sm:px-4 py-2 rounded-xl transition-colors text-sm sm:text-base"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>

        {/* Quick Stats - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Total Orders */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-sm border border-blue-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                  {userStats?.totalOrders || 0}
                </p>
                <div className="flex items-center mt-1 sm:mt-2">
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {userStats?.monthlyOrders || 0} this month
                  </span>
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-sm border border-emerald-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                  {userStats?.totalSpent || '$0'}
                </p>
                <div className="flex items-center mt-1 sm:mt-2">
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    Avg {userStats?.averageOrderValue || '$0'}
                  </span>
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg sm:rounded-xl">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-sm border border-orange-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                  {userStats?.pendingOrders || 0}
                </p>
                <div className="flex items-center mt-1 sm:mt-2">
                  <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3 inline mr-1" />
                    In process
                  </span>
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-orange-100 rounded-lg sm:rounded-xl">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Wishlist */}
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-sm border border-purple-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Wishlist</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                  {userStats?.wishlistItems || 0}
                </p>
                <div className="flex items-center mt-1 sm:mt-2">
                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    <Heart className="w-3 h-3 inline mr-1" />
                    Items saved
                  </span>
                </div>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg sm:rounded-xl">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 md:mb-8">
          {/* Recent Orders - Takes full width on mobile, 2/3 on desktop */}
          <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Recent Orders</h3>
                <Link href="/orders" className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  View All Orders
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm sm:text-base">No orders yet</p>
                  <button
                    onClick={handleContinueShopping}
                    className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
                  >
                    Start Shopping →
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 sm:space-y-4">
                    {recentOrders.slice(0, windowWidth < 768 ? 3 : 5).map((order) => {
                      const statusConfig = getStatusConfig(order.status);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                          <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-2 sm:mb-0">
                            <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${statusConfig.color.replace('text', 'bg')}`}>
                              <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 text-sm sm:text-base truncate">
                                {truncateText(order.id, windowWidth < 768 ? 12 : 20)}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                                <span className="text-xs text-gray-600">{formatDate(order.date)}</span>
                                <span className="hidden sm:inline text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-600">{order.items} items</span>
                                {order.expectedDelivery && windowWidth >= 640 && (
                                  <>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-emerald-600">
                                      Est: {order.expectedDelivery}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-2">
                            <p className="font-bold text-gray-800 text-base sm:text-lg">
                              {order.amount}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 sm:px-3 py-1 rounded-full font-medium ${statusConfig.color}`}>
                                {windowWidth < 640 
                                  ? order.status.charAt(0).toUpperCase() 
                                  : order.status.charAt(0).toUpperCase() + order.status.slice(1)
                                }
                              </span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleTrackOrder(order.tracking)}
                                  className="text-xs text-blue-600 hover:text-blue-700 font-medium p-1"
                                  title="Track order"
                                >
                                  <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                                <button
                                  onClick={() => handleViewOrder(order.id)}
                                  className="text-xs text-gray-600 hover:text-gray-800 font-medium p-1"
                                  title="View details"
                                >
                                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleContinueShopping}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all text-sm sm:text-base"
                    >
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      {windowWidth < 640 ? 'Shop' : 'Continue Shopping'}
                    </button>
                    <Link href="/orders">
                      <button className="flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50 text-gray-700 font-medium px-4 py-3 rounded-xl transition-all text-sm sm:text-base">
                        <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                        {windowWidth < 640 ? 'Orders' : 'View Orders'}
                      </button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Profile & Quick Actions - Below orders on mobile, sidebar on desktop */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">My Profile</h3>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:block gap-3">
                <Link href="/profile" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group">
                  <div className="p-2 bg-white rounded-lg">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm sm:text-base">Personal Info</p>
                    <p className="text-xs text-gray-600 hidden sm:block">Update profile details</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </Link>

                <Link href="/addresses" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group">
                  <div className="p-2 bg-white rounded-lg">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm sm:text-base">Addresses</p>
                    <p className="text-xs text-gray-600 hidden sm:block">Manage delivery addresses</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </Link>

                <Link href="/payment-methods" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group">
                  <div className="p-2 bg-white rounded-lg">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm sm:text-base">Payments</p>
                    <p className="text-xs text-gray-600 hidden sm:block">Manage payment options</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </Link>

                <Link href="/security" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group">
                  <div className="p-2 bg-white rounded-lg">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm sm:text-base">Security</p>
                    <p className="text-xs text-gray-600 hidden sm:block">Password & Privacy</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </Link>
              </div>

              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/help" className="flex flex-col items-center p-3 sm:p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group">
                    <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-blue-600 mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Help</span>
                  </Link>
                  <Link href="/support" className="flex flex-col items-center p-3 sm:p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group">
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-blue-600 mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Support</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wishlist Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 mb-6 md:mb-8">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">My Wishlist ❤️</h3>
              <Link href="/wishlist" className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View All
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            {wishlistItems.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm sm:text-base">Your wishlist is empty</p>
                <button
                  onClick={handleContinueShopping}
                  className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
                >
                  Browse Products →
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Carousel Layout */}
                {windowWidth < 768 ? (
                  <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {wishlistItems.map((item) => (
                      <div key={item._id} className="min-w-[200px] p-3 border border-gray-200 rounded-xl group">
                        <div className="w-full h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-2xl mb-3">
                          {item.image}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-600 mt-1">{item.category}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-gray-800">{item.price}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleAddToCartFromWishlist(item.productId, item._id)}
                                disabled={item.stock === 0}
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                              >
                                <ShoppingCart className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleRemoveFromWishlist(item._id)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {wishlistItems.map((item) => (
                      <div key={item._id} className="group p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md rounded-xl transition-all">
                        <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-4xl mb-4">
                          {item.image}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 line-clamp-1">{item.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{item.category}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-bold text-lg text-gray-800">{item.price}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAddToCartFromWishlist(item.productId, item._id)}
                                disabled={item.stock === 0}
                                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveFromWishlist(item._id)}
                                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 sm:mt-6 flex justify-center">
                  <button
                    onClick={handleContinueShopping}
                    className="flex items-center gap-2 border-2 border-dashed border-gray-300 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-700 font-medium px-4 py-3 rounded-xl transition-all text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    {windowWidth < 640 ? 'More Products' : 'Browse More Products'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Link href="/orders" className="bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center transition-all group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-blue-200 transition-colors">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <span className="font-medium text-gray-700 text-xs sm:text-sm">My Orders</span>
          </Link>
          
          <Link href="/tracking" className="bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center transition-all group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-emerald-200 transition-colors">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <span className="font-medium text-gray-700 text-xs sm:text-sm">Track Order</span>
          </Link>
          
          <Link href="/offers" className="bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center transition-all group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-orange-200 transition-colors">
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <span className="font-medium text-gray-700 text-xs sm:text-sm">Offers</span>
          </Link>
          
          <Link href="/reviews" className="bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center transition-all group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-purple-200 transition-colors">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <span className="font-medium text-gray-700 text-xs sm:text-sm">Reviews</span>
          </Link>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 z-50">
          <div className="grid grid-cols-5">
            <Link href="/dashboard" className="flex flex-col items-center justify-center py-2">
              <Home className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Home</span>
            </Link>
            <Link href="/shop" className="flex flex-col items-center justify-center py-2">
              <ShoppingBag className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-500">Shop</span>
            </Link>
            <Link href="/cart" className="flex flex-col items-center justify-center py-2">
              <ShoppingCart className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-500">Cart</span>
            </Link>
            <Link href="/wishlist" className="flex flex-col items-center justify-center py-2">
              <Heart className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-500">Wishlist</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center justify-center py-2">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-500">Profile</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}