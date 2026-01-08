"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  ShoppingBag,
  IndianRupee,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  RefreshCw,
  UserPlus,
  CheckCircle,
  XCircle,
  Loader2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  storeName?: string;
  storeType?: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Fetch customers
  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const res = await fetch(`/api/customers?${params}`);
      const data = await res.json();

      if (data.success) {
        setCustomers(data.customers);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter]);

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
    return format(new Date(dateString), "dd MMM yyyy");
  };

  // Handle customer selection
  const toggleCustomerSelection = (id: string) => {
    setSelectedCustomers(prev =>
      prev.includes(id)
        ? prev.filter(customerId => customerId !== id)
        : [...prev, id]
    );
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c._id));
    }
  };

  // Handle status change
  const handleStatusChange = async (customerId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      const data = await res.json();
      if (data.success) {
        fetchCustomers(pagination.page);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        fetchCustomers(pagination.page);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  // Handle customer click (for mobile)
  const handleCustomerClick = (e: React.MouseEvent, email: string) => {
    // Prevent navigation if clicking on checkbox or action buttons
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' || 
      target.tagName === 'BUTTON' || 
      target.closest('button') || 
      target.closest('a')
    ) {
      return;
    }
    router.push(`/customers/${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center justify-between sm:justify-start">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Customers</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Manage your customers and their details
                </p>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
            <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} sm:flex items-center gap-2 flex-wrap`}>
              <button
                onClick={() => fetchCustomers(pagination.page)}
                className="p-2 text-black hover:bg-gray-100 rounded-lg"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <Link href="/customers/new">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 text-sm sm:text-base">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Add Customer</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  className="w-full text-gray-800 pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <select
                className="border text-gray-500 border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 flex items-center gap-2 hover:bg-gray-50 text-sm sm:text-base"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">More Filters</span>
                <span className="sm:hidden">Filters</span>
              </button>
            </div>
          </div>

          {/* Additional Filters (Collapsible) */}
          {showFilters && (
            <div className="mt-4 text-gray-500 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Store Type
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base">
                  <option value="">All Types</option>
                  <option value="kirana">Kirana</option>
                  <option value="supermarket">Supermarket</option>
                  <option value="convenience">Convenience</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Orders
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base">
                  <option value="createdAt">Newest First</option>
                  <option value="name">Name A-Z</option>
                  <option value="totalOrders">Most Orders</option>
                  <option value="totalSpent">Highest Spending</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Customers</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Active Customers</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Orders</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
                </p>
              </div>
              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Revenue</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
                </p>
              </div>
              <IndianRupee className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Customers Table/List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Table Header */}
          <div className="px-3 sm:px-4 py-3 border-b bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedCustomers.length === customers.length && customers.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 w-4 h-4"
              />
              <span className="text-sm text-gray-600">
                {selectedCustomers.length} selected
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedCustomers.length > 0 && (
                <>
                  <button className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-1">
                    Export Selected
                  </button>
                  <button className="text-xs sm:text-sm text-red-600 hover:text-red-900 px-2 sm:px-3 py-1">
                    Delete Selected
                  </button>
                </>
              )}
              <button className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-1 flex items-center gap-1">
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export All</span>
                <span className="sm:hidden">Export</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="p-8 sm:p-12 text-center">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm sm:text-base">Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">No customers found</h3>
              <p className="text-gray-500 text-sm sm:text-base mb-4">
                {search ? "Try a different search term" : "Get started by adding your first customer"}
              </p>
              <Link href="/customers/new">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto">
                  <Plus className="w-4 h-4" />
                  Add Customer
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr 
                        key={customer._id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={(e) => handleCustomerClick(e, customer.email)}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedCustomers.includes(customer._id)}
                              onChange={() => toggleCustomerSelection(customer._id)}
                              className="rounded border-gray-300 w-4 h-4"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900">
                                  {customer.name}
                                </p>
                                {customer.storeName && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                    {customer.storeName}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                Joined {formatDate(customer.createdAt)}
                              </p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            {customer.phone && (
                              <div className="flex items-center text-gray-500 gap-2 text-sm">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span>{customer.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center text-gray-500 gap-2 text-sm">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="truncate max-w-[200px]">{customer.email}</span>
                            </div>
                            {customer.address && (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate max-w-[200px]">
                                  {customer.address}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(customer._id, customer.isActive);
                            }}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                              customer.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {customer.isActive ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                Inactive
                              </>
                            )}
                          </button>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Link href={`/customers/${encodeURIComponent(customer.email)}`}>
                              <button
                                className="p-1.5 hover:bg-gray-100 rounded"
                                title="View"
                              >
                                <Eye className="w-4 h-4 text-gray-600" />
                              </button>
                            </Link>
                            <Link href={`/customers/${encodeURIComponent(customer.email)}/edit`}>
                              <button
                                className="p-1.5 hover:bg-gray-100 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDeleteCustomer(customer._id)}
                              className="p-1.5 hover:bg-gray-100 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-gray-200">
                {customers.map((customer) => (
                  <div 
                    key={customer._id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => handleCustomerClick(e, customer.email)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer._id)}
                          onChange={() => toggleCustomerSelection(customer._id)}
                          className="rounded border-gray-300 w-4 h-4 mt-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-gray-900">
                              {customer.name}
                            </p>
                            {customer.storeName && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                {customer.storeName}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-gray-500 gap-2 text-sm">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{customer.email}</span>
                            </div>
                            {customer.phone && (
                              <div className="flex items-center text-gray-500 gap-2 text-sm">
                                <Phone className="w-3 h-3" />
                                <span>{customer.phone}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Joined {formatDate(customer.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(customer._id, customer.isActive);
                          }}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            customer.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {customer.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </button>
                        <div className="flex items-center gap-1">
                          <Link href={`/customers/${encodeURIComponent(customer.email)}`}>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                          </Link>
                          <Link href={`/customers/${encodeURIComponent(customer.email)}/edit`}>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Edit className="w-4 h-4 text-blue-600" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDeleteCustomer(customer._id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {!loading && customers.length > 0 && (
            <div className="px-3 sm:px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-gray-700">
                Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{" "}
                of <span className="font-medium">{pagination.total}</span> customers
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => fetchCustomers(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="p-2 sm:px-3 sm:py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <ChevronLeft className="w-4 h-4 sm:hidden" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                {pagination.totalPages <= 5 ? (
                  [...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => fetchCustomers(i + 1)}
                      className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm ${
                        pagination.page === i + 1
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))
                ) : (
                  <>
                    {pagination.page > 2 && <span className="px-2">...</span>}
                    {[
                      Math.max(1, pagination.page - 1),
                      pagination.page,
                      Math.min(pagination.totalPages, pagination.page + 1)
                    ].map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => fetchCustomers(pageNum)}
                        className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm ${
                          pagination.page === pageNum
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    {pagination.page < pagination.totalPages - 1 && <span className="px-2">...</span>}
                  </>
                )}
                <button
                  onClick={() => fetchCustomers(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="p-2 sm:px-3 sm:py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <ChevronRight className="w-4 h-4 sm:hidden" />
                  <span className="hidden sm:inline">Next</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}