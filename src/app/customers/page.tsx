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
  Loader2
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

      const res = await fetch(`/api/customers`);
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

  return (
    <div className="min-h-screen bg-gray-50">
        <Navbar/>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
              <p className="text-gray-600 mt-1">
                Manage your customers and their details
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchCustomers(pagination.page)}
                className="p-2 text-black hover:bg-gray-100 rounded-lg"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search customers by name, phone, or email..."
                  className="w-full text-gray-800 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <select
                className="border text-gray-500 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="border border-gray-300 rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>
          </div>

          {/* Additional Filters (Collapsible) */}
          {showFilters && (
            <div className="mt-4 text-gray-500 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Store Type
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
                </p>
              </div>
              <ShoppingBag className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
                </p>
              </div>
              <IndianRupee className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Table Header */}
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedCustomers.length === customers.length && customers.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">
                {selectedCustomers.length} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedCustomers.length > 0 && (
                <>
                  <button className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1">
                    Export Selected
                  </button>
                  <button className="text-sm text-red-600 hover:text-red-900 px-3 py-1">
                    Delete Selected
                  </button>
                </>
              )}
              <button className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 flex items-center gap-1">
                <Download className="w-4 h-4" />
                Export All
              </button>
            </div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No customers found</h3>
              <p className="text-gray-500 mb-4">
                {search ? "Try a different search term" : "Get started by adding your first customer"}
              </p>
              
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                    <tr key={customer._id} className="hover:bg-gray-50"  onClick={() => router.push(`/customers/${customer.email}`)}>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedCustomers.includes(customer._id)}
                            onChange={() => toggleCustomerSelection(customer._id)}
                            className="rounded border-gray-300"
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
                            <span>{customer.email}</span>
                          </div>
                          {customer.address && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">
                                {customer.address}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      
                      
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleStatusChange(customer._id, customer.isActive)}
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
                        <div className="flex items-center gap-2">
                          <Link href={`/customers/${customer._id}`}>
                            <button
                              className="p-1.5 hover:bg-gray-100 rounded"
                              title="View"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                          </Link>
                          <Link href={`/customers/${customer._id}/edit`}>
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
                          <button className="p-1.5 hover:bg-gray-100 rounded">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && customers.length > 0 && (
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{" "}
                of <span className="font-medium">{pagination.total}</span> customers
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchCustomers(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 text-gray-700 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => fetchCustomers(i + 1)}
                    className={`px-3 py-1 border rounded ${
                      pagination.page === i + 1
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => fetchCustomers(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1 text-gray-700 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}