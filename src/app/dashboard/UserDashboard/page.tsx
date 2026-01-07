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
  ArrowRight,
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
  Home,
  Truck,
  Loader2,
  AlertCircle,
  Trash2,
  X,
  Check,
  ExternalLink
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
  const router = useRouter();

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
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center max-w-md p-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Dashboard</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={fetchDashboardData}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
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
      
      <main className="p-4 md:p-6">
        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex justify-between items-center animate-fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
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
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {getUserInitials()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-800">
                  Welcome back, {userStats?.name || "User"}! 👋
                </h1>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 hover:bg-white rounded-xl border border-gray-200 transition-colors disabled:opacity-50"
                  title="Refresh dashboard"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              {userStats && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="flex items-center text-sm text-gray-600">
                    <Award className="w-4 h-4 mr-1" />
                    {userStats.membership} Member
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    Member since {userStats.joinDate}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                    <Crown className="w-3 h-3 inline mr-1" />
                    {userStats.loyaltyPoints} Loyalty Points
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Link href="/notifications">
              <button className="p-2 hover:bg-white rounded-xl border border-gray-200 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
            <Link href="/settings">
              <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-xl transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium px-4 py-2 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Orders */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-sm border border-blue-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{userStats.totalOrders}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {userStats.monthlyOrders} this month
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Spent */}
            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-6 shadow-sm border border-emerald-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{userStats.totalSpent}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      Average {userStats.averageOrderValue} per order
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 shadow-sm border border-orange-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{userStats.pendingOrders}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3 inline mr-1" />
                      In process
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Wishlist */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-sm border border-purple-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600">Wishlist Items</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{userStats.wishlistItems}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                      <Heart className="w-3 h-3 inline mr-1" />
                      {userStats.wishlistItems} items saved
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
                <Link href="/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  View All Orders
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No orders yet</p>
                  <button
                    onClick={handleContinueShopping}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Start Shopping →
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {recentOrders.map((order) => {
                      const statusConfig = getStatusConfig(order.status);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${statusConfig.color.replace('text', 'bg')}`}>
                              <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor}`} />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{order.id}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-600">{order.date}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-sm text-gray-600">{order.items} items</span>
                                {order.expectedDelivery && (
                                  <>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-sm text-emerald-600">
                                      Est. delivery: {order.expectedDelivery}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-bold text-gray-800 text-lg">{order.amount}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusConfig.color}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleTrackOrder(order.tracking)}
                                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                  title="Track order"
                                >
                                  <Truck className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleViewOrder(order.id)}
                                  className="text-xs text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1"
                                  title="View details"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={handleContinueShopping}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Continue Shopping
                    </button>
                    <Link href="/orders">
                      <button className="flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50 text-gray-700 font-medium px-6 py-3 rounded-xl transition-all">
                        <ShoppingBag className="w-4 h-4" />
                        View Orders
                      </button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Profile & Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">My Profile</h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <Link href="/profile" className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group">
                  <div className="p-2 bg-white rounded-lg">
                    <User className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Personal Information</p>
                    <p className="text-sm text-gray-600">Update your profile details</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </Link>

                <Link href="/addresses" className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group">
                  <div className="p-2 bg-white rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Delivery Address</p>
                    <p className="text-sm text-gray-600">Manage your addresses</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </Link>

                <Link href="/payment-methods" className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group">
                  <div className="p-2 bg-white rounded-lg">
                    <CreditCard className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Payment Methods</p>
                    <p className="text-sm text-gray-600">Manage your payment options</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </Link>

                <Link href="/security" className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group">
                  <div className="p-2 bg-white rounded-lg">
                    <Shield className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Security</p>
                    <p className="text-sm text-gray-600">Password & Privacy settings</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/help" className="flex flex-col items-center p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group">
                    <HelpCircle className="w-6 h-6 text-gray-600 group-hover:text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Help Center</span>
                  </Link>
                  <Link href="/support" className="flex flex-col items-center p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group">
                    <MessageSquare className="w-6 h-6 text-gray-600 group-hover:text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Support</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wishlist Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">My Wishlist ❤️</h3>
              <Link href="/wishlist" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {wishlistItems.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Your wishlist is empty</p>
                <button
                  onClick={handleContinueShopping}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Browse Products →
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {wishlistItems.map((item) => (
                    <div key={item._id} className="group p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md rounded-xl transition-all">
                      <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-4xl mb-4 group-hover:scale-[1.02] transition-transform">
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
                              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={item.stock === 0 ? "Out of stock" : "Add to cart"}
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveFromWishlist(item._id)}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                              title="Remove from wishlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {item.stock !== undefined && item.stock < 5 && (
                          <p className="text-xs text-orange-600 mt-2">
                            Only {item.stock} left in stock
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleContinueShopping}
                    className="flex items-center gap-2 border-2 border-dashed border-gray-300 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-700 font-medium px-6 py-3 rounded-xl transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Browse More Products
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/orders" className="bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl p-4 flex flex-col items-center justify-center transition-all group">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <span className="font-medium text-gray-700">My Orders</span>
          </Link>
          
          <Link href="/tracking" className="bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-xl p-4 flex flex-col items-center justify-center transition-all group">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
              <Truck className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="font-medium text-gray-700">Track Order</span>
          </Link>
          
          <Link href="/offers" className="bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 rounded-xl p-4 flex flex-col items-center justify-center transition-all group">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
              <Gift className="w-6 h-6 text-orange-600" />
            </div>
            <span className="font-medium text-gray-700">Offers & Deals</span>
          </Link>
          
          <Link href="/reviews" className="bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl p-4 flex flex-col items-center justify-center transition-all group">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <span className="font-medium text-gray-700">My Reviews</span>
          </Link>
        </div>
      </main>
    </div>
  );
}