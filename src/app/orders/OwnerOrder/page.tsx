// app/orders/ownerOrder.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  Home,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
  MoreVertical,
  Printer,
  MessageSquare,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Star,
  Shield,
  CreditCard,
} from "lucide-react";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  image?: string;
}

interface Order {
  _id: string;
  orderId: string;
  storeId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      landmark?: string;
    };
  };
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingCharge: number;
  totalAmount: number;
  payment: {
    method: "cod" | "online" | "card";
    status: "pending" | "completed" | "failed";
    transactionId?: string;
    paidAmount: number;
  };
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  delivery: {
    expectedDate?: string;
    slot?: string;
    deliveryPerson?: string;
    contact?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  avgOrderValue: number;
}

export default function OwnerOrder() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    avgOrderValue: 0,
  });
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Fetch orders for the owner's store
  useEffect(() => {
    fetchOwnerOrders();
  }, []);

  const fetchOwnerOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders/owner", {
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setFilteredOrders(data.orders || []);
      
      // Calculate stats
      const totalRevenue = data.orders.reduce((sum: number, order: Order) => 
        sum + order.totalAmount, 0);
      const pendingOrders = data.orders.filter((order: Order) => 
        order.status === "pending" || order.status === "confirmed").length;
      
      setStats({
        totalOrders: data.orders.length,
        totalRevenue,
        pendingOrders,
        avgOrderValue: data.orders.length > 0 ? totalRevenue / data.orders.length : 0,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search and filters
  useEffect(() => {
    let result = [...orders];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order =>
        order.orderId.toLowerCase().includes(query) ||
        order.customer.name.toLowerCase().includes(query) ||
        order.customer.phone.includes(query) ||
        order.customer.email.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(order => order.status === statusFilter);
    }

    // Date filter (simplified)
    if (dateFilter !== "all") {
      const now = new Date();
      result = result.filter(order => {
        const orderDate = new Date(order.createdAt);
        switch (dateFilter) {
          case "today":
            return orderDate.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredOrders(result);
  }, [searchQuery, statusFilter, dateFilter, orders]);

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setOrders(prev => prev.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        fetchOwnerOrders(); // Refresh data
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "shipped": return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "confirmed": return <CheckCircle className="w-4 h-4" />;
      case "processing": return <Package className="w-4 h-4" />;
      case "shipped": return <Truck className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-emerald-200 rounded-full mx-auto mb-4"></div>
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              <p className="text-gray-700">Loading orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Store Orders
              </h1>
              <p className="text-gray-600">Manage and track all customer orders</p>
            </div>
            <button
              onClick={fetchOwnerOrders}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 font-medium flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+12% from last month</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-xl">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-amber-100 to-amber-200 rounded-xl">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgOrderValue)}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Order ID, Customer Name, Phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100/50 border-2 border-gray-300/50 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 text-gray-900"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100/50 border-2 border-gray-300/50 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 text-gray-900"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100/50 border-2 border-gray-300/50 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 text-gray-900"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setDateFilter("all");
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-300/50 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Found</h3>
              <p className="text-gray-600 mb-6">No orders match your current filters</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setDateFilter("all");
                }}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 font-medium"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200/50">
              {filteredOrders.map((order) => (
                <div key={order._id} className="p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-gray-900">#{order.orderId}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)} flex items-center gap-1`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {format(new Date(order.createdAt), "MMM dd, yyyy • hh:mm a")}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Customer</p>
                          <p className="font-medium text-gray-900 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {order.customer.name}
                          </p>
                          <p className="text-sm text-gray-600">{order.customer.phone}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Payment</p>
                          <p className="font-medium text-gray-900 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            {order.payment.method.toUpperCase()}
                          </p>
                          <p className={`text-sm ${order.payment.status === 'completed' ? 'text-emerald-600' : 'text-yellow-600'}`}>
                            {order.payment.status}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                          <p className="text-xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                          <p className="text-sm text-gray-600">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Expandable Items */}
                      <div className="mt-4">
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          {expandedOrder === order._id ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide Items
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Show Items ({order.items.length})
                            </>
                          )}
                        </button>

                        {expandedOrder === order._id && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-bold text-gray-900 mb-3">Order Items</h4>
                                <div className="space-y-3">
                                  {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                      <div>
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        <p className="text-sm text-gray-600">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                                      </div>
                                      <p className="font-bold text-gray-900">{formatCurrency(item.totalPrice)}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-bold text-gray-900 mb-3">Delivery Details</h4>
                                <div className="p-4 bg-white rounded-lg border">
                                  <div className="space-y-2">
                                    <p className="flex items-center gap-2 text-gray-700">
                                      <MapPin className="w-4 h-4" />
                                      {order.customer.address.street}
                                    </p>
                                    <p className="text-gray-700">
                                      {order.customer.address.city}, {order.customer.address.state} - {order.customer.address.pincode}
                                    </p>
                                    {order.customer.address.landmark && (
                                      <p className="text-sm text-gray-600">
                                        Landmark: {order.customer.address.landmark}
                                      </p>
                                    )}
                                    <p className="text-sm text-gray-600 mt-3">
                                      <Calendar className="w-4 h-4 inline mr-1" />
                                      Expected: {order.delivery.expectedDate ? 
                                        format(new Date(order.delivery.expectedDate), "MMM dd, yyyy • hh:mm a") : 
                                        "ASAP"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateOrderStatus(order._id, "confirmed")}
                          disabled={order.status !== "pending"}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            order.status === "pending"
                              ? "bg-blue-500 hover:bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order._id, "processing")}
                          disabled={order.status !== "confirmed"}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            order.status === "confirmed"
                              ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          Process
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateOrderStatus(order._id, "shipped")}
                          disabled={order.status !== "processing"}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            order.status === "processing"
                              ? "bg-purple-500 hover:bg-purple-600 text-white"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          Ship
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order._id, "delivered")}
                          disabled={order.status !== "shipped"}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            order.status === "shipped"
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          Deliver
                        </button>
                      </div>
                      <button
                        onClick={() => updateOrderStatus(order._id, "cancelled")}
                        disabled={order.status === "cancelled" || order.status === "delivered"}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          order.status !== "cancelled" && order.status !== "delivered"
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}