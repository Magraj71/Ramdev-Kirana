// app/customers/[email]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  User,
  DollarSign,
  TrendingUp,
  BarChart3,
  ShoppingCart,
  Filter,
  MoreVertical,
  Store,
  Layers,
  Search,
  List,
  Grid,
  ExternalLink,
  Printer,
  Award,
  Utensils,
  ShoppingBasket,
  Gift,
  Sparkles,
  Book,
  Coffee,
  Watch,
  Headphones,
  Camera,
  Smartphone,
  Globe,
  Briefcase,
  PieChart,
  Users,
  Tag,
  Home,
  Settings,
  Bell,
  Info,
  AlertCircle,
  Heart,
  Trash2,
  Edit,
  Copy,
  FileText,
} from "lucide-react";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  image?: string;
  category?: string;
}

interface Order {
  _id: string;
  orderId: string;
  storeId: string;
  customer: {
    _id?: string;
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
    method: "cod" | "online" | "card" | "wallet";
    status: "pending" | "completed" | "failed" | "refunded";
    transactionId?: string;
    paidAmount: number;
  };
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
  delivery: {
    expectedDate?: string;
    slot?: string;
    deliveryPerson?: string;
    contact?: string;
    trackingId?: string;
    carrier?: string;
    estimatedDelivery?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  storeName?: string;
  storeType?: string;
  customerNotes?: string;
  rating?: number;
  review?: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  storeName?: string;
  storeType?: string;
  customerSince: string;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  deliveredOrders: number;
  pendingOrders: number;
  recentOrders: number;
  successRate: number;
  avgOrderFrequency: number;
}

// Fetch function for customer orders
const fetchCustomerOrders = async (email: string, filter = 'all', page = 1) => {
  try {
    // Decode email from URL params
    const decodedEmail = decodeURIComponent(email);
    
    const response = await fetch(
      `/api/customers/${encodeURIComponent(decodedEmail)}/orders?filter=${filter}&page=${page}&limit=10`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch customer orders');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Fetch customer stats
const fetchCustomerStats = async (email: string) => {
  try {
    const decodedEmail = decodeURIComponent(email);
    
    const response = await fetch(`/api/customers/${encodeURIComponent(decodedEmail)}/stats`, {
      headers: {
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch customer stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

export default function CustomerOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const email = params.email as string;
  
  const [data, setData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    if (email) {
      loadCustomerData();
      loadCustomerStats();
    }
  }, [email]);
  
  const loadCustomerData = async (filter = 'all', page = 1) => {
    setLoading(true);
    try {
      const result = await fetchCustomerOrders(email, filter, page);
      setData(result);
      setActiveFilter(filter);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load orders:', error);
      // Set empty data on error
      setData({
        success: false,
        orders: [],
        customerInfo: null,
        pagination: { currentPage: 1, totalPages: 1, totalOrders: 0 }
      });
    } finally {
      setLoading(false);
    }
  };
  
  const loadCustomerStats = async () => {
    setStatsLoading(true);
    try {
      const result = await fetchCustomerStats(email);
      setStats(result.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };
  
  const handleFilterChange = (filter: string) => {
    loadCustomerData(filter, 1);
  };
  
  const handlePageChange = (page: number) => {
    if (data?.pagination && page >= 1 && page <= data.pagination.totalPages) {
      loadCustomerData(activeFilter, page);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "shipped": return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "returned": return "bg-rose-100 text-rose-800 border-rose-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "confirmed": return <CheckCircle className="w-4 h-4" />;
      case "processing": return <Package className="w-4 h-4" />;
      case "shipped": return <Truck className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      case "returned": return <RefreshCw className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };
  
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cod": return <DollarSign className="w-4 h-4" />;
      case "online": return <Globe className="w-4 h-4" />;
      case "card": return <CreditCard className="w-4 h-4" />;
      case "wallet": return <Smartphone className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };
  
  // Filter orders based on search query
  const filteredOrders = data?.orders?.filter((order: Order) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      order.orderId.toLowerCase().includes(query) ||
      order.customer.name.toLowerCase().includes(query) ||
      order.items.some(item => item.name.toLowerCase().includes(query)) ||
      order.status.toLowerCase().includes(query)
    );
  }) || [];
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (!data?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Customer Not Found</h1>
          <p className="text-gray-600 mb-6">The customer with email {decodeURIComponent(email)} was not found in our system.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-medium flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            <button
              onClick={() => router.push('/customers')}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-medium flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              View All Customers
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const customer = data.customerInfo;
  
  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Orders', count: customer.totalOrders, color: 'bg-gray-500', icon: <Layers className="w-4 h-4" /> },
    { value: 'pending', label: 'Pending', count: data.filters?.available?.find((f: any) => f.value === 'pending')?.count || 0, color: 'bg-yellow-500', icon: <Clock className="w-4 h-4" /> },
    { value: 'processing', label: 'Processing', count: data.filters?.available?.find((f: any) => f.value === 'processing')?.count || 0, color: 'bg-indigo-500', icon: <Package className="w-4 h-4" /> },
    { value: 'shipped', label: 'Shipped', count: data.filters?.available?.find((f: any) => f.value === 'shipped')?.count || 0, color: 'bg-purple-500', icon: <Truck className="w-4 h-4" /> },
    { value: 'delivered', label: 'Delivered', count: customer.deliveredOrders, color: 'bg-emerald-500', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'cancelled', label: 'Cancelled', count: data.filters?.available?.find((f: any) => f.value === 'cancelled')?.count || 0, color: 'bg-red-500', icon: <XCircle className="w-4 h-4" /> },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">Back to Customers</span>
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  loadCustomerData(activeFilter, currentPage);
                  loadCustomerStats();
                }}
                className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Customer Orders
          </h1>
          <p className="text-gray-600">View and manage all orders for {customer.name}</p>
        </div>
        
        {/* Customer Profile Card */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-xl p-6 mb-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                  <User className="w-10 h-10" />
                </div>
                {customer.successRate > 80 && (
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-emerald-600">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-1">{customer.name}</h2>
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Customer since {format(new Date(customer.customerSince), 'MMM yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {customer.storeName && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="flex items-center gap-2 mb-1">
                  <Store className="w-5 h-5" />
                  <span className="font-bold">{customer.storeName}</span>
                </div>
                {customer.storeType && (
                  <span className="text-sm opacity-90">{customer.storeType}</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Stats Grid */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Stats cards */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Total Orders</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{customer.totalOrders}</p>
              <p className="text-sm text-gray-600 mt-2">
                {customer.deliveredOrders} delivered • {customer.pendingOrders} pending
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Total Spent</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
              <p className="text-sm text-gray-600 mt-2">
                Avg: {formatCurrency(customer.avgOrderValue)} per order
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Success Rate</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{customer.successRate}%</p>
              <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                    style={{ width: `${customer.successRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Order Frequency</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">Every {customer.avgOrderFrequency} days</p>
              <p className="text-sm text-gray-600 mt-2">
                {customer.recentOrders} orders in last 30 days
              </p>
            </div>
          </div>
        )}
        
        {/* Filters Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Filter Orders</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {filterOptions.map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleFilterChange(filter.value)}
                className={`px-4 py-2.5 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeFilter === filter.value
                    ? `${filter.color} text-white shadow-lg transform scale-105`
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {filter.icon}
                <span>{filter.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeFilter === filter.value 
                    ? 'bg-white/30' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Orders Count */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            {filteredOrders.length} {activeFilter === 'all' ? 'Orders' : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1) + ' Orders'}
          </h3>
          {searchQuery && (
            <span className="text-sm text-gray-600">
              Found {filteredOrders.length} orders matching "{searchQuery}"
            </span>
          )}
        </div>
        
        {/* Orders List */}
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchQuery
                    ? `No orders found matching "${searchQuery}". Try a different search term.`
                    : activeFilter === 'all'
                    ? "No orders found for this customer."
                    : `No ${activeFilter} orders found for this customer.`}
                </p>
                {(searchQuery || activeFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      handleFilterChange('all');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-medium"
                  >
                    View All Orders
                  </button>
                )}
              </div>
            ) : (
              filteredOrders.map((order: Order) => (
                <div key={order._id} className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200/50">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">Order #{order.orderId}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)} flex items-center gap-2`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(order.createdAt), 'MMM dd, yyyy • hh:mm a')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {getPaymentMethodIcon(order.payment.method)}
                            <span className="capitalize">{order.payment.method}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              order.payment.status === 'completed' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : order.payment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {order.payment.status}
                            </span>
                          </div>
                          {order.storeName && (
                            <div className="flex items-center gap-1.5">
                              <Store className="w-4 h-4" />
                              <span>{order.storeName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                        <p className="text-sm text-gray-600">{order.items.length} items</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Preview */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-white flex items-center justify-center overflow-hidden">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.items[0]?.name}
                            {order.items.length > 1 && ` + ${order.items.length - 1} more`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                          className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200"
                        >
                          {expandedOrder === order._id ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              View Details
                            </>
                          )}
                        </button>
                        
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Expanded Order Details */}
                    {expandedOrder === order._id && (
                      <div className="mt-6 pt-6 border-t border-gray-200/50">
                        {/* Items Grid */}
                        <div className="mb-8">
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Order Items
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {order.items.map((item, index) => (
                              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 hover:from-gray-100 hover:to-gray-200 transition-all duration-200">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 bg-white rounded-lg border flex items-center justify-center overflow-hidden">
                                    {item.image ? (
                                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <Package className="w-6 h-6 text-gray-400" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.name}</p>
                                    <div className="flex items-center gap-4 mt-1">
                                      <p className="text-sm text-gray-600">
                                        {item.quantity} × {formatCurrency(item.unitPrice)} • {item.unit}
                                      </p>
                                      {item.category && (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                          {item.category}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-gray-900">{formatCurrency(item.totalPrice)}</p>
                                    <p className="text-sm text-gray-600">Total</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Price Breakdown and Delivery Info */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                          {/* Price Breakdown */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <DollarSign className="w-5 h-5" />
                              Price Breakdown
                            </h4>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5">
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-700">Subtotal</span>
                                  <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
                                </div>
                                {order.discountAmount > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">Discount</span>
                                    <span className="font-medium text-emerald-600">-{formatCurrency(order.discountAmount)}</span>
                                  </div>
                                )}
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
                                <div className="border-t border-gray-300 pt-3 mt-3">
                                  <div className="flex justify-between">
                                    <span className="font-bold text-gray-900">Total Amount</span>
                                    <span className="text-xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Delivery Info */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <MapPin className="w-5 h-5" />
                              Delivery Information
                            </h4>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5">
                              <div className="space-y-3">
                                <div>
                                  <p className="font-medium text-gray-900">{order.customer.address.street}</p>
                                  <p className="text-gray-700">
                                    {order.customer.address.city}, {order.customer.address.state} - {order.customer.address.pincode}
                                  </p>
                                </div>
                                {order.customer.address.landmark && (
                                  <div>
                                    <p className="text-sm text-gray-600">Landmark:</p>
                                    <p className="text-gray-700">{order.customer.address.landmark}</p>
                                  </div>
                                )}
                                {order.delivery.expectedDate && (
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <Calendar className="w-4 h-4" />
                                    <span>Expected: {format(new Date(order.delivery.expectedDate), 'MMM dd, yyyy • hh:mm a')}</span>
                                  </div>
                                )}
                                {order.delivery.trackingId && (
                                  <div className="pt-3 mt-3 border-t border-gray-300">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Truck className="w-4 h-4" />
                                        <span className="font-medium">Tracking ID:</span>
                                        <span className="text-gray-700">{order.delivery.trackingId}</span>
                                      </div>
                                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                        Track
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                          <button 
                            onClick={() => router.push(`/orders/${order._id}`)}
                            className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Full Order
                          </button>
                          <button className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-medium flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Download Invoice
                          </button>
                          <button className="px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-medium flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Contact Customer
                          </button>
                          <button className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-medium flex items-center gap-2">
                            <Printer className="w-4 h-4" />
                            Print Label
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Grid View (simplified)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order: Order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">#{order.orderId}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} flex items-center gap-1.5 w-fit`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    <p className="text-xs text-gray-600">{format(new Date(order.createdAt), 'MMM dd')}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {order.items[0]?.name || 'Order items'}
                    {order.items.length > 1 && ` + ${order.items.length - 1} more`}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/orders/${order._id}`)}
                    className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {data.pagination && data.pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center">
            <nav className="flex items-center gap-2" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  currentPage > 1
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, data.pagination.totalPages))].map((_, i) => {
                  let pageNum;
                  if (data.pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= data.pagination.totalPages - 2) {
                    pageNum = data.pagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white transform scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {data.pagination.totalPages > 5 && currentPage < data.pagination.totalPages - 2 && (
                  <>
                    <span className="px-2 text-gray-400">...</span>
                    <button
                      onClick={() => handlePageChange(data.pagination.totalPages)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors duration-200 ${
                        currentPage === data.pagination.totalPages
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {data.pagination.totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === data.pagination.totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  currentPage < data.pagination.totalPages
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}