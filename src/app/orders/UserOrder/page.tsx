// app/orders/userOrder.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  CreditCard,
  Calendar,
  RefreshCw,
  Eye,
  Download,
  MessageSquare,
  Star,
  Shield,
  ChevronDown,
  ChevronUp,
  Filter,
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
    trackingId?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  storeName?: string;
  storeType?: string;
}

export default function UserOrder() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Fetch user's orders by email
  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders/user", {
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "processing": return "bg-indigo-100 text-indigo-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-emerald-100 text-emerald-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-emerald-200 rounded-full mx-auto mb-4"></div>
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              <p className="text-gray-700">Loading your orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            My Orders
          </h1>
          <p className="text-gray-600">Track and manage all your orders in one place</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-4">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-4">
            <p className="text-sm text-gray-600">To Deliver</p>
            <p className="text-2xl font-bold text-gray-900">
              {orders.filter(o => !["delivered", "cancelled"].includes(o.status)).length}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-4">
            <p className="text-sm text-gray-600">Delivered</p>
            <p className="text-2xl font-bold text-gray-900">
              {orders.filter(o => o.status === "delivered").length}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-4">
            <p className="text-sm text-gray-600">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              filter === "all"
                ? "bg-emerald-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
              filter === "pending"
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending
          </button>
          <button
            onClick={() => setFilter("processing")}
            className={`px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
              filter === "processing"
                ? "bg-indigo-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Package className="w-4 h-4" />
            Processing
          </button>
          <button
            onClick={() => setFilter("shipped")}
            className={`px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
              filter === "shipped"
                ? "bg-purple-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Truck className="w-4 h-4" />
            Shipped
          </button>
          <button
            onClick={() => setFilter("delivered")}
            className={`px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
              filter === "delivered"
                ? "bg-emerald-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Delivered
          </button>
          <button
            onClick={() => setFilter("cancelled")}
            className={`px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
              filter === "cancelled"
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <XCircle className="w-4 h-4" />
            Cancelled
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-6">
              {filter === "all" 
                ? "You haven't placed any orders yet."
                : `No ${filter} orders found.`}
            </p>
            <button
              onClick={() => router.push("/shop")}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 font-medium"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">Order #{order.orderId}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} flex items-center gap-2`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Placed on {format(new Date(order.createdAt), "MMMM dd, yyyy • hh:mm a")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                      <p className="text-sm text-gray-600">{order.items.length} items</p>
                    </div>
                  </div>

                  {/* Store Info */}
                  {order.storeName && (
                    <div className="flex items-center gap-2 text-gray-700 mb-3">
                      <ShoppingBag className="w-4 h-4" />
                      <span className="font-medium">{order.storeName}</span>
                      {order.storeType && (
                        <span className="text-sm text-gray-500">• {order.storeType}</span>
                      )}
                    </div>
                  )}

                  {/* Payment Info */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">Payment: {order.payment.method.toUpperCase()}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.payment.status === 'completed' 
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.payment.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">
                        Expected: {order.delivery.expectedDate ? 
                          format(new Date(order.delivery.expectedDate), "MMM dd, hh:mm a") : 
                          "ASAP"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="mb-4">
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
                  </div>

                  {expandedOrder === order._id && (
                    <>
                      {/* Items List */}
                      <div className="mb-6">
                        <h4 className="font-bold text-gray-900 mb-4">Order Items</h4>
                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white rounded-lg border flex items-center justify-center overflow-hidden">
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <Package className="w-6 h-6 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{item.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {item.quantity} × {formatCurrency(item.unitPrice)} • {item.unit}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">{formatCurrency(item.totalPrice)}</p>
                                <p className="text-sm text-gray-600">Total</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="mb-6">
                        <h4 className="font-bold text-gray-900 mb-4">Price Breakdown</h4>
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-700">Subtotal</span>
                              <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700">Discount</span>
                              <span className="font-medium text-emerald-600">-{formatCurrency(order.discountAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700">Tax (GST)</span>
                              <span className="font-medium text-gray-900">{formatCurrency(order.taxAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700">Shipping</span>
                              <span className="font-medium text-gray-900">
                                {order.shippingCharge === 0 ? "FREE" : formatCurrency(order.shippingCharge)}
                              </span>
                            </div>
                            <div className="border-t border-gray-300 pt-2 mt-2">
                              <div className="flex justify-between">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="text-xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-4">Delivery Address</h4>
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-4">
                          <div className="space-y-2">
                            <p className="font-medium text-gray-900 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {order.customer.address.street}
                            </p>
                            <p className="text-gray-700">
                              {order.customer.address.city}, {order.customer.address.state} - {order.customer.address.pincode}
                            </p>
                            {order.customer.address.landmark && (
                              <p className="text-gray-600">
                                <span className="font-medium">Landmark:</span> {order.customer.address.landmark}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-300">
                              <div className="flex items-center gap-2 text-gray-700">
                                <Phone className="w-4 h-4" />
                                {order.customer.phone}
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <Mail className="w-4 h-4" />
                                {order.customer.email}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tracking Info */}
                      {order.delivery.trackingId && (
                        <div className="mt-6">
                          <h4 className="font-bold text-gray-900 mb-4">Tracking Information</h4>
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Truck className="w-5 h-5 text-blue-600" />
                                <div>
                                  <p className="font-medium text-gray-900">Tracking ID: {order.delivery.trackingId}</p>
                                  <p className="text-sm text-gray-600">Live tracking available</p>
                                </div>
                              </div>
                              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                Track Order
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-6 flex flex-wrap gap-3">
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Contact Support
                        </button>
                        <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Download Invoice
                        </button>
                        {order.status === "delivered" && (
                          <button className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Rate Order
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}