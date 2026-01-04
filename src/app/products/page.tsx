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
  Layers
} from "lucide-react";
import QuickStockUpdate from "@/components/QuickStockUpdate";

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

  // Fetch products and categories
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchStats();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/products");
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }
      
      // Check if response has content
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
    if (selectedProducts.length === sortedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(sortedProducts.map(p => p._id));
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
        fetchStats(); // Refresh stats
        alert("Products deleted successfully!");
      } else {
        throw new Error(data.message || "Failed to delete products");
      }
    } catch (error) {
      console.error("Failed to delete products:", error);
      alert(error instanceof Error ? error.message : "Failed to delete products. Please try again.");
    }
  };

  // Update stock
  // src/app/products/page.tsx में
// const handleStockUpdate = async (productId: string, newStock: number) => {
//   try {
//     const response = await fetch(`/api/products/${productId}/stock`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ stock: newStock })
//     });
    
//     const data = await response.json();
    
//     if (data.success) {
//       alert("Stock updated successfully!");
//       fetchProducts(); // Refresh products list
//     } else {
//       throw new Error(data.message);
//     }
//   } catch (error) {
//     console.error("Error updating stock:", error);
//     alert("Failed to update stock");
//   }
// };

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
        fetchProducts(); // Refresh products
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
        fetchStats(); // Refresh stats
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
    if (stock === 0) return { label: "Out of Stock", color: "text-red-600", bg: "bg-red-100" };
    if (stock < minStock) return { label: "Low Stock", color: "text-orange-600", bg: "bg-orange-100" };
    return { label: "In Stock", color: "text-emerald-600", bg: "bg-emerald-100" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <Navbar />
      
      <main className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Products Management</h1>
            </div>
            <p className="text-gray-600">
              Manage your inventory, track stock levels, and organize products
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Link 
              href="/products/new"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <p className="font-medium">Error: {error}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                fetchProducts();
                fetchCategories();
                fetchStats();
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stats.totalProducts}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stats.lowStock}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full" 
                  style={{ width: `${(stats.lowStock / Math.max(stats.totalProducts, 1)) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-orange-600 font-medium">
                {stats.totalProducts > 0 ? Math.round((stats.lowStock / stats.totalProducts) * 100) : 0}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stats.outOfStock}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full" 
                  style={{ width: `${(stats.outOfStock / Math.max(stats.totalProducts, 1)) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-red-600 font-medium">
                {stats.totalProducts > 0 ? Math.round((stats.outOfStock / stats.totalProducts) * 100) : 0}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">₹{stats.totalValue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <IndianRupee className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-purple-600 font-medium">Based on cost price</span>
            </div>
          </div>
        </div>

        {/* Filters and Actions Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left Section - Search & Filters */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text"
                  placeholder="Search products by name, SKU or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category.name}>
                      {category.name} ({category.productCount})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="stock">Sort by Stock</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Sort Order Toggle */}
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="p-2.5 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {sortOrder === "asc" ? (
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>

            {/* Right Section - View & Actions */}
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${viewMode === "grid" ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${viewMode === "list" ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Bulk Actions */}
              {selectedProducts.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedProducts.length} selected
                  </span>
                  <button
                    onClick={deleteSelectedProducts}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}

              {/* Export & Refresh */}
              <button
                onClick={exportProducts}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Export</span>
              </button>
              <button
                onClick={() => {
                  setError(null);
                  fetchProducts();
                  fetchCategories();
                  fetchStats();
                }}
                className="p-2.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid/List View */}
        {loading ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedCategory !== "all" 
                  ? "No products match your search criteria. Try adjusting your filters." 
                  : "You haven't added any products yet. Start by adding your first product."}
              </p>
              <Link 
                href="/products/new"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Your First Product
              </Link>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock, product.minStockLevel);
              
              return (
                <div 
                  key={product._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden group"
                >
                  {/* Product Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => toggleProductSelection(product._id)}
                            className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                          />
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {product.sku}
                          </span>
                          <button
                            onClick={() => toggleProductStatus(product._id, product.isActive)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              product.isActive 
                                ? "bg-emerald-100 text-emerald-600" 
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {product.isActive ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Product Image/Details */}
                  <div className="p-4">
                    {product.image ? (
                      <div className="mb-4">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-4">
                        <Package className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Price</p>
                          <p className="text-xl font-bold text-gray-800">₹{product.price}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Cost</p>
                          <p className="text-lg font-medium text-gray-700">₹{product.costPrice}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Margin</p>
                          <p className="text-lg font-bold text-emerald-600">
                            {product.costPrice > 0 
                              ? (((product.price - product.costPrice) / product.costPrice) * 100).toFixed(1)
                              : "0.0"}%
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">Stock</p>
                          <div className="flex items-center gap-2">
                            <p className={`font-bold ${product.stock < 10 ? 'text-red-600' : 'text-gray-800'}`}>
                              {product.stock} {product.unit}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                              {stockStatus.label}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Min Stock</p>
                          <p className="font-medium text-gray-700">{product.minStockLevel} {product.unit}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <Link 
                        href={`/products/${product._id}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                      <Link 
                        href={`/products/edit/${product._id}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Link>
                      {/* <button
                        onClick={() => {
                          const newStock = prompt(`Update stock for ${product.name}:`, product.stock.toString());
                          if (newStock && !isNaN(Number(newStock))) {
                            // updateStock(product._id, parseInt(newStock));
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors"
                      >
                        <Layers className="w-4 h-4" />
                        Stock
                      </button> */}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-3 px-6 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === sortedProducts.length && sortedProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Product</th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Stock</th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock, product.minStockLevel);
                  
                  return (
                    <tr 
                      key={product._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => toggleProductSelection(product._id)}
                          className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-gray-800">₹{product.price}</p>
                          <p className="text-xs text-gray-500">Cost: ₹{product.costPrice}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className={`font-bold ${product.stock < 10 ? 'text-red-600' : 'text-gray-800'}`}>
                            {product.stock} {product.unit}
                          </p>
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
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
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${stockStatus.bg} ${stockStatus.color} w-fit`}>
                            {stockStatus.label}
                          </span>
                          <button
                            onClick={() => toggleProductStatus(product._id, product.isActive)}
                            className={`text-xs px-2 py-1 rounded-full w-fit ${
                              product.isActive 
                                ? "bg-emerald-100 text-emerald-700" 
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/products/${product._id}`}
                            className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link 
                            href={`/products/edit/${product._id}`}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => {
                              const newStock = prompt(`Update stock for ${product.name}:`, product.stock.toString());
                              if (newStock && !isNaN(Number(newStock))) {
                                updateStock(product._id, parseInt(newStock));
                              }
                            }}
                            className="p-2 hover:bg-orange-50 text-orange-600 rounded-lg transition-colors"
                            title="Update Stock"
                          >
                            <Layers className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteSingleProduct(product._id, product.name)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {sortedProducts.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-gray-600">
              Showing {sortedProducts.length} of {products.length} products
            </p>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                1
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                2
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                3
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}