"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  ChevronDown,
  Download,
  MoreVertical,
  Grid,
  List,
  Check,
  X,
  ArrowUpDown,
  Hash,
  IndianRupee,
  Tag,
  Star,
  BarChart3,
  RefreshCw,
  Layers,
  Menu,
  XCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Product Type Definition
interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minStockLevel: number;
  unit: string;
  barcode?: string;
  brand?: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category Type
interface Category {
  _id: string;
  name: string;
  productCount: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Fetch products and categories
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchStats();
  }, []);

  // Close filter menu on click outside for mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isFilterOpen && !target.closest('.filter-menu')) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/products");
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      if (!text) {
        throw new Error("Empty response from server");
      }
      
      const data = JSON.parse(text);
      
      if (data.success) {
        setProducts(data.products || []);
      } else {
        throw new Error(data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setError(error instanceof Error ? error.message : "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setError(null);
      const response = await fetch("/api/products/categories");
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      if (!text) {
        throw new Error("Empty response from server");
      }
      
      const data = JSON.parse(text);
      
      if (data.success) {
        setCategories(data.categories || []);
      } else {
        throw new Error(data.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  };

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await fetch("/api/products/stats");
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      if (!text) {
        throw new Error("Empty response from server");
      }
      
      const data = JSON.parse(text);
      
      if (data.success) {
        setStats(data.stats || {
          totalProducts: 0,
          lowStock: 0,
          outOfStock: 0,
          totalValue: 0
        });
      } else {
        throw new Error(data.message || "Failed to fetch stats");
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setStats({
        totalProducts: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0
      });
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc" 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortBy === "price") {
      return sortOrder === "asc" 
        ? a.price - b.price
        : b.price - a.price;
    }
    if (sortBy === "stock") {
      return sortOrder === "asc" 
        ? a.stock - b.stock
        : b.stock - a.stock;
    }
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  // Toggle product selection
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Select/Deselect all
  const toggleSelectAll = () => {
    if (selectedProducts.length === paginatedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(paginatedProducts.map(p => p._id));
    }
  };

  // Delete selected products
  const deleteSelectedProducts = async () => {
    if (!selectedProducts.length) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)?`)) return;
    
    try {
      setError(null);
      const response = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedProducts })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      if (!text) {
        throw new Error("Empty response from server");
      }
      
      const data = JSON.parse(text);
      
      if (data.success) {
        setProducts(prev => prev.filter(p => !selectedProducts.includes(p._id)));
        setSelectedProducts([]);
        fetchStats();
        alert("Products deleted successfully!");
      } else {
        throw new Error(data.message || "Failed to delete products");
      }
    } catch (error) {
      console.error("Failed to delete products:", error);
      alert(error instanceof Error ? error.message : "Failed to delete products. Please try again.");
    }
  };

  // Toggle product status
  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      setError(null);
      const response = await fetch(`/api/products/${productId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      if (!text) {
        throw new Error("Empty response from server");
      }
      
      const data = JSON.parse(text);
      
      if (data.success) {
        fetchProducts();
      } else {
        throw new Error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  // Delete single product
  const deleteSingleProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;
    
    try {
      setError(null);
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      if (!text) {
        throw new Error("Empty response from server");
      }
      
      const data = JSON.parse(text);
      
      if (data.success) {
        setProducts(prev => prev.filter(p => p._id !== productId));
        fetchStats();
        alert("Product deleted successfully!");
      } else {
        throw new Error(data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert(error instanceof Error ? error.message : "Failed to delete product. Please try again.");
    }
  };

  // Export products
  const exportProducts = () => {
    if (sortedProducts.length === 0) {
      alert("No products to export!");
      return;
    }
    
    const exportData = sortedProducts.map(product => ({
      SKU: product.sku,
      Name: product.name,
      Category: product.category,
      Price: product.price,
      Cost: product.costPrice,
      Stock: product.stock,
      'Min Stock': product.minStockLevel,
      Unit: product.unit,
      Status: product.isActive ? 'Active' : 'Inactive'
    }));
    
    const csv = convertToCSV(exportData);
    downloadCSV(csv, 'products-export.csv');
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(header => row[header]));
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  // Calculate stock status
  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: "Out", color: "text-red-600", bg: "bg-red-100" };
    if (stock < minStock) return { label: "Low", color: "text-orange-600", bg: "bg-orange-100" };
    return { label: "In Stock", color: "text-emerald-600", bg: "bg-emerald-100" };
  };

  // Responsive functions
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <Navbar />
      
      <main className="p-3 sm:p-4 md:p-6 max-w-[1920px] mx-auto">
        {/* Mobile Menu Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Header - Responsive */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
              <div className="p-1.5 md:p-2 bg-emerald-100 rounded-lg md:rounded-xl">
                <Package className="w-4 h-4 md:w-6 md:h-6 text-emerald-600" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Products</h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 hidden md:block">
              Manage your inventory, track stock levels, and organize products
            </p>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <Link 
              href="/products/new"
              className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-sm md:text-base px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </div>
        </div>

        {/* Error Message - Responsive */}
        {error && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg md:rounded-xl">
            <div className="flex items-start gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm font-medium flex-1">{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                fetchProducts();
                fetchCategories();
                fetchStats();
              }}
              className="mt-2 text-xs md:text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          {[
            { 
              label: "Total", 
              value: stats.totalProducts, 
              icon: Package, 
              color: "emerald",
              bg: "bg-emerald-100",
              iconColor: "text-emerald-600"
            },
            { 
              label: "Low Stock", 
              value: stats.lowStock, 
              icon: AlertTriangle, 
              color: "orange",
              bg: "bg-orange-100",
              iconColor: "text-orange-600"
            },
            { 
              label: "Out of Stock", 
              value: stats.outOfStock, 
              icon: X, 
              color: "red",
              bg: "bg-red-100",
              iconColor: "text-red-600"
            },
            { 
              label: "Value", 
              value: `₹${stats.totalValue.toLocaleString()}`, 
              icon: IndianRupee, 
              color: "purple",
              bg: "bg-purple-100",
              iconColor: "text-purple-600"
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mt-1 md:mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 md:p-3 ${stat.bg} rounded-lg`}>
                  <stat.icon className={`w-4 h-4 md:w-5 md:h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <Filter className="w-4 h-4" />
            <span>Filters & Sort</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filters and Actions Bar - Responsive */}
        <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                <input 
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none pl-3 md:pl-4 pr-8 md:pr-10 py-2 md:py-2.5 text-sm md:text-base border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category.name}>
                      {category.name} ({category.productCount})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 md:w-4 md:h-4 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-3 md:pl-4 pr-8 md:pr-10 py-2 md:py-2.5 text-sm md:text-base border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="stock">Sort by Stock</option>
                </select>
                <ArrowUpDown className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 md:w-4 md:h-4 pointer-events-none" />
              </div>

              {/* Sort Order Toggle */}
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="p-2 md:p-2.5 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {sortOrder === "asc" ? (
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                )}
              </button>
            </div>

            {/* Right Section - View & Actions */}
            <div className="flex items-center justify-between md:justify-normal gap-2 md:gap-3">
              {/* View Toggle */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 md:p-2 transition-colors ${viewMode === "grid" ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 md:p-2 transition-colors ${viewMode === "list" ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                  title="List View"
                >
                  <List className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              {/* Bulk Actions for Mobile */}
              {selectedProducts.length > 0 && (
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="text-xs md:text-sm text-gray-600 hidden sm:inline">
                    {selectedProducts.length} selected
                  </span>
                  <button
                    onClick={deleteSelectedProducts}
                    className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-xs md:text-sm"
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden md:inline">Delete</span>
                  </button>
                </div>
              )}

              {/* Export & Refresh */}
              <button
                onClick={exportProducts}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors text-xs md:text-sm"
                title="Export"
              >
                <Download className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden md:inline">Export</span>
              </button>
              <button
                onClick={() => {
                  setError(null);
                  fetchProducts();
                  fetchCategories();
                  fetchStats();
                }}
                className="p-1.5 md:p-2.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Mobile Filters Dropdown */}
          {isFilterOpen && (
            <div className="filter-menu mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 lg:hidden">
              <div className="space-y-3">
                {/* Search for Mobile */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.slice(0, 3).map(category => (
                        <option key={category._id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                      {categories.length > 3 && (
                        <option value="more">More...</option>
                      )}
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="name">Name</option>
                      <option value="price">Price</option>
                      <option value="stock">Stock</option>
                    </select>
                  </div>
                </div>

                {/* Sort Order */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Sort Order:</span>
                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg bg-white"
                  >
                    {sortOrder === "asc" ? (
                      <>
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">Ascending</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-sm">Descending</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid/List View - Responsive */}
        {loading ? (
          <div className="bg-white rounded-xl p-8 md:p-12 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-4 border-emerald-500 border-t-transparent"></div>
              <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-600">Loading products...</p>
            </div>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="bg-white rounded-xl p-6 md:p-12 shadow-sm border border-gray-100">
            <div className="text-center">
              <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">No products found</h3>
              <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                {searchQuery || selectedCategory !== "all" 
                  ? "No products match your search criteria." 
                  : "You haven't added any products yet."}
              </p>
              <Link 
                href="/products/new"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 md:px-6 md:py-3 rounded-xl transition-colors text-sm md:text-base"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                Add Your First Product
              </Link>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          // Grid View - Responsive
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
            {paginatedProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock, product.minStockLevel);
              
              return (
                <div 
                  key={product._id}
                  className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden group"
                >
                  {/* Product Header */}
                  <div className="p-3 md:p-4 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => toggleProductSelection(product._id)}
                            className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 flex-shrink-0"
                          />
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-1.5 md:px-2 py-0.5 md:py-1 rounded truncate">
                            {product.sku}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base truncate" title={product.name}>
                          {product.name}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 mt-0.5 truncate">{product.category}</p>
                      </div>
                      <button
                        onClick={() => toggleProductStatus(product._id, product.isActive)}
                        className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center ml-2 flex-shrink-0 ${
                          product.isActive 
                            ? "bg-emerald-100 text-emerald-600" 
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {product.isActive ? (
                          <Check className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        ) : (
                          <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Product Image/Details */}
                  <div className="p-3 md:p-4">
                    {product.image ? (
                      <div className="mb-3 md:mb-4">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-28 md:h-40 object-cover rounded-lg"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-28 md:h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                        <Package className="w-8 h-8 md:w-12 md:h-12 text-gray-300" />
                      </div>
                    )}
                    
                    <div className="space-y-2 md:space-y-3">
                      <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                        <div>
                          <p className="text-xs md:text-sm text-gray-600">Price</p>
                          <p className="text-sm md:text-lg font-bold text-gray-800 truncate">₹{product.price}</p>
                        </div>
                        <div>
                          <p className="text-xs md:text-sm text-gray-600">Cost</p>
                          <p className="text-sm md:text-base font-medium text-gray-700 truncate">₹{product.costPrice}</p>
                        </div>
                        <div>
                          <p className="text-xs md:text-sm text-gray-600">Margin</p>
                          <p className="text-sm md:text-base font-bold text-emerald-600 truncate">
                            {product.costPrice > 0 
                              ? (((product.price - product.costPrice) / product.costPrice) * 100).toFixed(1)
                              : "0.0"}%
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                        <div>
                          <p className="text-xs md:text-sm text-gray-600">Stock</p>
                          <div className="flex items-center gap-1.5">
                            <p className={`text-sm md:text-base font-bold ${product.stock < 10 ? 'text-red-600' : 'text-gray-800'}`}>
                              {product.stock}
                            </p>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                              {stockStatus.label}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs md:text-sm text-gray-600">Min</p>
                          <p className="text-sm md:text-base font-medium text-gray-700">{product.minStockLevel}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-3 md:p-4 border-t border-gray-100">
                    <div className="flex gap-1.5 md:gap-2">
                      <Link 
                        href={`/products/${product._id}`}
                        className="flex-1 flex items-center justify-center gap-1 md:gap-2 py-1.5 md:py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors text-xs md:text-sm"
                      >
                        <Eye className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden xs:inline">View</span>
                      </Link>
                      <Link 
                        href={`/products/edit/${product._id}`}
                        className="flex-1 flex items-center justify-center gap-1 md:gap-2 py-1.5 md:py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-xs md:text-sm"
                      >
                        <Edit className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden xs:inline">Edit</span>
                      </Link>
                      <button
                        onClick={() => deleteSingleProduct(product._id, product.name)}
                        className="flex-1 flex items-center justify-center gap-1 md:gap-2 py-1.5 md:py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-xs md:text-sm"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden xs:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View - Responsive
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-2 md:py-3 px-3 md:px-6 text-left">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                        onChange={toggleSelectAll}
                        className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                      />
                    </th>
                    <th className="py-2 md:py-3 px-3 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700">Product</th>
                    <th className="py-2 md:py-3 px-3 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700">Category</th>
                    <th className="py-2 md:py-3 px-3 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700">Price</th>
                    <th className="py-2 md:py-3 px-3 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700">Stock</th>
                    <th className="py-2 md:py-3 px-3 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700">Status</th>
                    <th className="py-2 md:py-3 px-3 md:px-6 text-left text-xs md:text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock, product.minStockLevel);
                    
                    return (
                      <tr 
                        key={product._id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 md:py-4 px-3 md:px-6">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => toggleProductSelection(product._id)}
                            className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="py-3 md:py-4 px-3 md:px-6">
                          <div className="flex items-center gap-2 md:gap-3">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-8 h-8 md:w-10 md:h-10 object-cover rounded-lg"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Package className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 text-xs md:text-sm truncate max-w-[120px] md:max-w-[200px]">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate max-w-[100px] md:max-w-[150px]">{product.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 md:py-4 px-3 md:px-6">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs md:text-sm whitespace-nowrap">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-3 md:py-4 px-3 md:px-6">
                          <div>
                            <p className="font-bold text-gray-800 text-sm md:text-base">₹{product.price}</p>
                            <p className="text-xs text-gray-500">Cost: ₹{product.costPrice}</p>
                          </div>
                        </td>
                        <td className="py-3 md:py-4 px-3 md:px-6">
                          <div>
                            <p className={`font-bold ${product.stock < 10 ? 'text-red-600' : 'text-gray-800'} text-sm md:text-base`}>
                              {product.stock} {product.unit}
                            </p>
                            <div className="w-16 md:w-24 h-1.5 md:h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                              <div 
                                className={`h-full ${
                                  product.stock === 0 ? 'bg-red-500' :
                                  product.stock < product.minStockLevel ? 'bg-orange-500' :
                                  'bg-emerald-500'
                                }`}
                                style={{ 
                                  width: `${Math.min((product.stock / Math.max(product.minStockLevel * 3, 1)) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 md:py-4 px-3 md:px-6">
                          <div className="flex flex-col gap-1">
                            <span className={`text-xs px-2 py-0.5 md:py-1 rounded-full ${stockStatus.bg} ${stockStatus.color} w-fit`}>
                              {stockStatus.label}
                            </span>
                            <button
                              onClick={() => toggleProductStatus(product._id, product.isActive)}
                              className={`text-xs px-2 py-0.5 md:py-1 rounded-full w-fit ${
                                product.isActive 
                                  ? "bg-emerald-100 text-emerald-700" 
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 md:py-4 px-3 md:px-6">
                          <div className="flex items-center gap-1 md:gap-2">
                            <Link 
                              href={`/products/${product._id}`}
                              className="p-1.5 md:p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="w-3 h-3 md:w-4 md:h-4" />
                            </Link>
                            <Link 
                              href={`/products/edit/${product._id}`}
                              className="p-1.5 md:p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-3 h-3 md:w-4 md:h-4" />
                            </Link>
                            <button
                              onClick={() => deleteSingleProduct(product._id, product.name)}
                              className="p-1.5 md:p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination - Responsive */}
        {sortedProducts.length > 0 && (
          <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-0">
            <p className="text-xs md:text-sm text-gray-600 order-2 sm:order-1">
              Showing {startIndex + 1}-{Math.min(endIndex, sortedProducts.length)} of {sortedProducts.length} products
            </p>
            <div className="flex items-center gap-1 md:gap-2 order-1 sm:order-2">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 md:p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              
              {/* Page numbers - responsive */}
              {(() => {
                const pages = [];
                const maxVisible = window.innerWidth < 640 ? 3 : 5;
                
                let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                
                if (endPage - startPage + 1 < maxVisible) {
                  startPage = Math.max(1, endPage - maxVisible + 1);
                }
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border rounded-lg text-sm md:text-base font-medium ${
                        currentPage === i
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
                
                return pages;
              })()}
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 md:p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-50 lg:hidden">
          <Link
            href="/products/new"
            className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl transition-all"
          >
            <Plus className="w-6 h-6 text-white" />
          </Link>
        </div>
      </main>
    </div>
  );
}