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
  PieChart,
  Users,
  Tag,
  Home,
  Info,
  AlertCircle,
  Trash2,
  Edit,
  FileText,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  PhoneCall,
  Mail as MailIcon,
  Map,
  Clock as ClockIcon,
  ShoppingBasket,
  Star,
  Percent,
  Truck as TruckIcon,
  Smartphone,
  Loader2
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
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
    setShowMobileFilters(false);
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
      case "online": return <CreditCard className="w-4 h-4" />;
      case "card": return <CreditCard className="w-4 h-4" />;
      case "wallet": return <Smartphone className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-4 md:p-6 lg:p-8">
          {/* Mobile Skeleton */}
          <div className="animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded w-10"></div>
            </div>
            
            {/* Customer Profile Card */}
            <div className="bg-gray-200 rounded-xl h-40 mb-6"></div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            
            {/* Filters */}
            <div className="h-10 bg-gray-200 rounded-lg mb-4"></div>
            
            {/* Orders */}
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-md mx-auto text-center pt-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Customer Not Found</h1>
            <p className="text-gray-600 mb-6">
              The customer with email {decodeURIComponent(email)} was not found.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.back()}
                className="px-5 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
              <button
                onClick={() => router.push('/customers')}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                All Customers
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const customer = data.customerInfo;
  
  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All', count: customer.totalOrders, color: 'bg-gray-500', icon: <Layers className="w-4 h-4" /> },
    { value: 'pending', label: 'Pending', count: customer.pendingOrders || 0, color: 'bg-yellow-500', icon: <Clock className="w-4 h-4" /> },
    { value: 'processing', label: 'Processing', count: data.filters?.available?.find((f: any) => f.value === 'processing')?.count || 0, color: 'bg-indigo-500', icon: <Package className="w-4 h-4" /> },
    { value: 'shipped', label: 'Shipped', count: data.filters?.available?.find((f: any) => f.value === 'shipped')?.count || 0, color: 'bg-purple-500', icon: <Truck className="w-4 h-4" /> },
    { value: 'delivered', label: 'Delivered', count: customer.deliveredOrders, color: 'bg-emerald-500', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'cancelled', label: 'Cancelled', count: data.filters?.available?.find((f: any) => f.value === 'cancelled')?.count || 0, color: 'bg-red-500', icon: <XCircle className="w-4 h-4" /> },
  ];

  const filteredOrders = data.orders || [];

  // Mobile-friendly Order Card Component
  const MobileOrderCard = ({ order }: { order: Order }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
      {/* Order Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 text-sm">#{order.orderId}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)} flex items-center gap-1`}>
                {getStatusIcon(order.status)}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {format(new Date(order.createdAt), 'MMM dd, yyyy')}
            </p>
          </div>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
        </div>
        
        {/* Quick Info */}
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <ShoppingBasket className="w-3 h-3" />
            <span>{order.items.length} items</span>
          </div>
          <div className="flex items-center gap-1">
            {getPaymentMethodIcon(order.payment.method)}
            <span className="capitalize">{order.payment.method}</span>
          </div>
        </div>
      </div>
      
      {/* Items Preview */}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex -space-x-2">
            {order.items.slice(0, 3).map((item, index) => (
              <div key={index} className="w-8 h-8 bg-gray-100 rounded border border-white flex items-center justify-center">
                <Package className="w-3 h-3 text-gray-400" />
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="w-8 h-8 bg-gray-800 rounded border border-white flex items-center justify-center text-white text-xs">
                +{order.items.length - 3}
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 text-sm truncate">
              {order.items[0]?.name || 'Order items'}
              {order.items.length > 1 && ` + ${order.items.length - 1} more`}
            </p>
            <p className="text-xs text-gray-600">
              {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
            className="flex-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg flex items-center justify-center gap-1"
          >
            {expandedOrder === order._id ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                Details
              </>
            )}
          </button>
          <button
            onClick={() => router.push(`/orders/${order._id}`)}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg"
          >
            View
          </button>
        </div>
      </div>
      
      {/* Expanded Details */}
      {expandedOrder === order._id && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="space-y-3">
            {/* Price Breakdown */}
            <div>
              <h4 className="font-medium text-gray-900 text-sm mb-2">Price Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-emerald-600">-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatCurrency(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {order.shippingCharge === 0 ? "FREE" : formatCurrency(order.shippingCharge)}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-1 mt-1">
                  <div className="flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Delivery Info */}
            <div>
              <h4 className="font-medium text-gray-900 text-sm mb-2 flex items-center gap-1">
                <TruckIcon className="w-3 h-3" />
                Delivery
              </h4>
              <p className="text-sm text-gray-600">
                {order.customer.address.street}, {order.customer.address.city}
              </p>
              {order.delivery.expectedDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Expected: {format(new Date(order.delivery.expectedDate), 'MMM dd')}
                </p>
              )}
            </div>
            
            {/* More Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button className="px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg flex items-center justify-center gap-1">
                <Download className="w-3 h-3" />
                Invoice
              </button>
              <button className="px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg flex items-center justify-center gap-1">
                <MessageSquare className="w-3 h-3" />
                Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Mobile Filters Modal */}
      {isMobile && showMobileFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowMobileFilters(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Filter Orders</h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-2">
                {filterOptions.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => handleFilterChange(filter.value)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg ${
                      activeFilter === filter.value
                        ? `${filter.color.replace('500', '600')} text-white`
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {filter.icon}
                      <span className="font-medium">{filter.label}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      activeFilter === filter.value 
                        ? 'bg-white/30' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Customer Orders
                </h1>
                <p className="text-sm text-gray-600 truncate max-w-[200px] md:max-w-none">
                  {customer.name} • {customer.email}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  loadCustomerData(activeFilter, currentPage);
                  loadCustomerStats();
                }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                aria-label="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              {isMobile ? (
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  aria-label="Filter"
                >
                  <Filter className="w-5 h-5" />
                </button>
              ) : (
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-500 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-48 md:w-64 text-gray-100 placeholder-gray-300"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Customer Profile Card - Mobile */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl p-4 mb-6 text-white">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg mb-1 truncate">{customer.name}</h2>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <MailIcon className="w-3 h-3" />
                  <span className="truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <PhoneCall className="w-3 h-3" />
                  <span>{customer.phone}</span>
                </div>
              </div>
            </div>
            {customer.storeName && (
              <div className="bg-white/20 rounded-lg p-2 text-xs">
                <Store className="w-3 h-3 inline mr-1" />
                {customer.storeName}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-white/10 rounded-lg p-2">
              <p className="text-2xl font-bold">{customer.totalOrders}</p>
              <p className="text-xs opacity-90">Total Orders</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <p className="text-2xl font-bold">{formatCurrency(customer.totalSpent)}</p>
              <p className="text-xs opacity-90">Total Spent</p>
            </div>
          </div>
        </div>
        
        {/* Stats Grid - Mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs text-gray-500">Orders</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{customer.totalOrders}</p>
            <p className="text-xs text-gray-600 mt-1">
              {customer.deliveredOrders} delivered
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500">Spent</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
            <p className="text-xs text-gray-600 mt-1">
              Avg: {formatCurrency(customer.avgOrderValue)}
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs text-gray-500">Success Rate</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{customer.successRate}%</p>
            <div className="mt-2">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                  style={{ width: `${customer.successRate}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs text-gray-500">Frequency</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">Every {customer.avgOrderFrequency}d</p>
            <p className="text-xs text-gray-600 mt-1">
              {customer.recentOrders} last 30d
            </p>
          </div>
        </div>
        
        {/* Desktop Filters */}
        {!isMobile && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Filter Orders</h3>
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
                  className={`px-4 py-2.5 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeFilter === filter.value
                      ? `${filter.color} text-white shadow-lg`
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
        )}
        
        {/* Mobile Search Bar */}
        {isMobile && (
          <div className="mb-6">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders by ID, item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-500 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-100 placeholder-gray-300"
              />
            </div>
          </div>
        )}
        
        {/* Orders Count */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">
            {filteredOrders.length} {activeFilter === 'all' ? 'Orders' : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
          </h3>
          {isMobile && (
            <button
              onClick={() => setShowMobileFilters(true)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium flex items-center gap-1"
            >
              <Filter className="w-3 h-3" />
              Filter
            </button>
          )}
        </div>
        
        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? 'No orders match your search. Try different keywords.'
                : `No ${activeFilter !== 'all' ? activeFilter : ''} orders found.`}
            </p>
            {(searchQuery || activeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  handleFilterChange('all');
                }}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium"
              >
                View All Orders
              </button>
            )}
          </div>
        ) : isMobile ? (
          // Mobile View
          <div>
            {filteredOrders.map((order: Order) => (
              <MobileOrderCard key={order._id} order={order} />
            ))}
          </div>
        ) : viewMode === 'list' ? (
          // Desktop List View
          <div className="space-y-4">
            {filteredOrders.map((order: Order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200">
                {/* Desktop Order Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h3 className="font-bold text-gray-900">#{order.orderId}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} flex items-center gap-2`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                      <p className="text-sm text-gray-600">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <ShoppingBasket className="w-4 h-4" />
                      <span>{order.items.length} items</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(order.payment.method)}
                      <span className="capitalize">{order.payment.method}</span>
                    </div>
                    {order.storeName && (
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        <span>{order.storeName}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Desktop Order Preview */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="w-10 h-10 bg-gray-100 rounded border border-white flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-10 h-10 bg-gray-800 rounded border border-white flex items-center justify-center text-white text-xs">
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
                        className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium flex items-center gap-2"
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
                      <button
                        onClick={() => router.push(`/orders/${order._id}`)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium"
                      >
                        Full View
                      </button>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {expandedOrder === order._id && (
                    <div className="mt-6 pt-6 border-t">
                      {/* Desktop expanded content */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4">Price Breakdown</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span>Subtotal</span>
                              <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                            </div>
                            {order.discountAmount > 0 && (
                              <div className="flex justify-between">
                                <span>Discount</span>
                                <span className="text-emerald-600 font-medium">-{formatCurrency(order.discountAmount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Tax</span>
                              <span className="font-medium">{formatCurrency(order.taxAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shipping</span>
                              <span className="font-medium">
                                {order.shippingCharge === 0 ? "FREE" : formatCurrency(order.shippingCharge)}
                              </span>
                            </div>
                            <div className="border-t pt-3">
                              <div className="flex justify-between font-bold">
                                <span>Total</span>
                                <span>{formatCurrency(order.totalAmount)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4">Delivery Info</h4>
                          <div className="space-y-2">
                            <p className="text-gray-900">{order.customer.address.street}</p>
                            <p className="text-gray-600">
                              {order.customer.address.city}, {order.customer.address.state} - {order.customer.address.pincode}
                            </p>
                            {order.delivery.expectedDate && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>Expected: {format(new Date(order.delivery.expectedDate), 'MMM dd, yyyy')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Desktop Actions */}
                      <div className="flex gap-3 mt-6 pt-6 border-t">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Invoice
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Contact
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2">
                          <Printer className="w-4 h-4" />
                          Print
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Desktop Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order: Order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
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
                    className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {data.pagination && data.pagination.totalPages > 1 && (
          <div className="mt-8">
            <nav className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  currentPage > 1
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isMobile ? <ChevronLeft className="w-4 h-4" /> : 'Previous'}
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
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-lg text-sm font-medium ${
                        currentPage === pageNum
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === data.pagination.totalPages}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  currentPage < data.pagination.totalPages
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isMobile ? <ChevronRight className="w-4 h-4" /> : 'Next'}
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}