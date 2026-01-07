"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Package, 
  Tag, 
  IndianRupee, 
  Layers,
  AlertTriangle,
  Copy,
  Eye,
  TrendingUp,
  TrendingDown,
  Star,
  ShoppingBag,
  Calendar,
  Clock,
  Hash,
  Scale,
  Box,
  Truck,
  User,
  Mail,
  Phone,
  BarChart3,
  Download,
  Share2,
  Printer,
  MoreVertical,
  ChevronRight,
  Check,
  X,
  RefreshCw,
  ArrowUpRight,
  Info,
  Shield,
  Menu,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Maximize2,
  FileText,
  Users,
  PackagePlus,
  ExternalLink,
  QrCode,
  ShoppingCart
} from "lucide-react";

// Product Type Definition
interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  subcategory?: string;
  brand?: string;
  barcode?: string;
  description?: string;
  price: number;
  costPrice: number;
  mrp?: number;
  discount: number;
  taxRate: number;
  stock: number;
  minStockLevel: number;
  maxStockLevel?: number;
  unit: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  supplier?: {
    name?: string;
    contact?: string;
    email?: string;
  };
  reorderLevel: number;
  image?: string;
  images?: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    name: string;
    email: string;
  };
  storeId: string;
  // Sales statistics
  totalSold?: number;
  revenueGenerated?: number;
  lastSoldAt?: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'pricing' | 'inventory' | 'history'>('details');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch product data
  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Close mobile menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('.mobile-action-menu')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.product);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      alert("Failed to load product. Please try again.");
      router.push("/products");
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (data.success) {
        alert("Product deleted successfully!");
        router.push("/products");
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  // Update stock
  const updateStock = async (newStock: number) => {
    try {
      const response = await fetch(`/api/products/${productId}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock })
      });

      const data = await response.json();
      if (data.success) {
        fetchProduct(); // Refresh product data
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Failed to update stock. Please try again.");
    }
  };

  // Toggle product status
  const toggleProductStatus = async () => {
    if (!product) return;
    
    try {
      const response = await fetch(`/api/products/${productId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive })
      });

      const data = await response.json();
      if (data.success) {
        fetchProduct(); // Refresh product data
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  // Duplicate product
  const handleDuplicate = async () => {
    if (!product) return;
    
    if (!confirm("Create a duplicate of this product?")) return;

    try {
      const duplicateData = {
        name: `${product.name} (Copy)`,
        sku: `${product.sku}-COPY`,
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand,
        barcode: product.barcode,
        description: product.description,
        price: product.price,
        costPrice: product.costPrice,
        mrp: product.mrp,
        discount: product.discount,
        taxRate: product.taxRate,
        stock: product.stock,
        minStockLevel: product.minStockLevel,
        maxStockLevel: product.maxStockLevel,
        unit: product.unit,
        weight: product.weight,
        dimensions: product.dimensions,
        supplier: product.supplier,
        reorderLevel: product.reorderLevel,
        image: product.image,
        images: product.images,
        isActive: true,
        isFeatured: false
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicateData)
      });

      const data = await response.json();

      if (data.success) {
        alert("Product duplicated successfully!");
        router.push("/products");
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error duplicating product:", error);
      alert("Failed to duplicate product. Please try again.");
    }
  };

  // Export product details
  const exportProductDetails = () => {
    if (!product) return;
    
    const exportData = {
      "Product Details": {
        "Name": product.name,
        "SKU": product.sku,
        "Category": product.category,
        "Subcategory": product.subcategory || "N/A",
        "Brand": product.brand || "N/A",
        "Barcode": product.barcode || "N/A",
        "Description": product.description || "N/A"
      },
      "Pricing": {
        "Cost Price": `₹${product.costPrice}`,
        "Selling Price": `₹${product.price}`,
        "MRP": product.mrp ? `₹${product.mrp}` : "N/A",
        "Discount": `${product.discount}%`,
        "Tax Rate": `${product.taxRate}%`,
        "Margin": `${(((product.price - product.costPrice) / product.costPrice) * 100).toFixed(1)}%`,
        "Margin Amount": `₹${(product.price - product.costPrice).toFixed(2)}`
      },
      "Inventory": {
        "Current Stock": `${product.stock} ${product.unit}`,
        "Minimum Stock Level": `${product.minStockLevel} ${product.unit}`,
        "Maximum Stock Level": product.maxStockLevel ? `${product.maxStockLevel} ${product.unit}` : "N/A",
        "Reorder Level": `${product.reorderLevel} ${product.unit}`,
        "Stock Status": getStockStatus(product.stock, product.minStockLevel).label,
        "Unit": product.unit,
        "Weight": product.weight ? `${product.weight} kg` : "N/A"
      },
      "Additional Info": {
        "Status": product.isActive ? "Active" : "Inactive",
        "Featured": product.isFeatured ? "Yes" : "No",
        "Created": new Date(product.createdAt).toLocaleString(),
        "Last Updated": new Date(product.updatedAt).toLocaleString()
      }
    };

    const content = Object.entries(exportData).map(([section, data]) => {
      return `\n${section}:\n${Object.entries(data).map(([key, value]) => `  ${key}: ${value}`).join('\n')}`;
    }).join('\n\n');

    const blob = new Blob([`PRODUCT DETAILS REPORT\n${content}`], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${product.sku}-details.txt`;
    a.click();
  };

  // Print product details
  const printProductDetails = () => {
    window.print();
  };

  // Share product details
  const shareProductDetails = async () => {
    if (!product) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} - ₹${product.price}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Sharing cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Get stock status
  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { 
      label: "Out of Stock", 
      color: "text-red-600", 
      bg: "bg-red-100",
      icon: <X className="w-4 h-4" />
    };
    if (stock < minStock) return { 
      label: "Low Stock", 
      color: "text-orange-600", 
      bg: "bg-orange-100",
      icon: <AlertTriangle className="w-4 h-4" />
    };
    return { 
      label: "In Stock", 
      color: "text-emerald-600", 
      bg: "bg-emerald-100",
      icon: <Check className="w-4 h-4" />
    };
  };

  // Calculate margin
  const calculateMargin = () => {
    if (!product) return { percentage: 0, amount: 0 };
    const marginAmount = product.price - product.costPrice;
    const marginPercentage = product.costPrice > 0 ? (marginAmount / product.costPrice) * 100 : 0;
    return { percentage: marginPercentage, amount: marginAmount };
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mobile tabs for better organization
  const MobileTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {product?.description || "No description available"}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Specifications</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">SKU</span>
                  <span className="font-medium text-gray-800 text-sm">{product?.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Category</span>
                  <span className="font-medium text-gray-800 text-sm">{product?.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Unit</span>
                  <span className="font-medium text-gray-800 text-sm">{product?.unit}</span>
                </div>
                {product?.brand && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Brand</span>
                    <span className="font-medium text-gray-800 text-sm">{product.brand}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'pricing':
        const margin = calculateMargin();
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Pricing Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Cost Price</span>
                  <span className="font-medium text-gray-800">₹{product?.costPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Selling Price</span>
                  <span className="font-bold text-emerald-600 text-lg">₹{product?.price}</span>
                </div>
                {product?.mrp && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">MRP</span>
                    <span className="font-medium text-gray-800 line-through">₹{product.mrp}</span>
                  </div>
                )}
                {product?.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Discount</span>
                    <span className="font-bold text-red-600">{product.discount}%</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Profit Margin</span>
                    <div className="text-right">
                      <p className={`font-bold ${margin.percentage > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {margin.percentage.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-600">₹{margin.amount.toFixed(2)} per unit</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'inventory':
        const stockStatus = getStockStatus(product?.stock || 0, product?.minStockLevel || 0);
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Inventory Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Current Stock</p>
                    <p className="font-bold text-gray-800 text-xl">{product?.stock} {product?.unit}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                    {stockStatus.label}
                  </span>
                </div>
                
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${stockStatus.bg.replace('bg-', 'bg-').replace('-100', '-500')}`}
                    style={{ 
                      width: `${Math.min(((product?.stock || 0) / ((product?.minStockLevel || 0) * 3)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-600 text-xs">Minimum Level</p>
                    <p className="font-medium text-gray-800">{product?.minStockLevel} {product?.unit}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-600 text-xs">Reorder Level</p>
                    <p className="font-medium text-gray-800">{product?.reorderLevel} {product?.unit}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    const newStock = prompt(`Update stock for ${product?.name}:`, product?.stock.toString());
                    if (newStock && !isNaN(Number(newStock))) {
                      updateStock(parseInt(newStock));
                    }
                  }}
                  className="w-full py-2 border-2 border-emerald-500 text-emerald-600 font-medium rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Update Stock
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'history':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Product History</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Created</span>
                  <div className="text-right">
                    <p className="font-medium text-gray-800 text-sm">{formatDate(product?.createdAt || '')}</p>
                    <p className="text-xs text-gray-500">{formatTime(product?.createdAt || '')}</p>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Last Updated</span>
                  <div className="text-right">
                    <p className="font-medium text-gray-800 text-sm">{formatDate(product?.updatedAt || '')}</p>
                    <p className="text-xs text-gray-500">{formatTime(product?.updatedAt || '')}</p>
                  </div>
                </div>
                
                {product?.createdBy && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Created By</span>
                    <div className="text-right">
                      <p className="font-medium text-gray-800 text-sm">{product.createdBy.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
        <Navbar />
        <div className="p-4 flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
        <Navbar />
        <div className="p-4 md:p-6">
          <div className="bg-white rounded-lg md:rounded-xl p-6 md:p-8 text-center">
            <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-colors text-sm md:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock, product.minStockLevel);
  const margin = calculateMargin();
  const images = product.image ? [product.image, ...(product.images || [])] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 lg:hidden">
          <div className="p-4 flex items-center justify-between">
            <Link 
              href="/products"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            
            <div className="flex-1 px-3 min-w-0">
              <h1 className="font-bold text-gray-800 truncate text-sm">{product.name}</h1>
              <p className="text-xs text-gray-500 truncate">SKU: {product.sku}</p>
            </div>
            
            <div className="relative mobile-action-menu">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
              
              {isMobileMenuOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link 
                    href={`/products/edit/${productId}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Edit Product</span>
                  </Link>
                  <button
                    onClick={handleDuplicate}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 w-full"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">Duplicate</span>
                  </button>
                  <button
                    onClick={exportProductDetails}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 w-full"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Export</span>
                  </button>
                  <button
                    onClick={printProductDetails}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 w-full"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="text-sm">Print</span>
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 w-full"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Delete Product</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Status Bar */}
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                  {stockStatus.label}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <span className="text-lg font-bold text-emerald-600">₹{product.price}</span>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link 
                href="/products"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Products
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                      {stockStatus.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-sm text-gray-600">SKU: {product.sku}</span>
                    <span className="text-gray-400 hidden md:inline">•</span>
                    <span className="text-sm text-gray-600">Category: {product.category}</span>
                    {product.brand && (
                      <>
                        <span className="text-gray-400 hidden md:inline">•</span>
                        <span className="text-sm text-gray-600">Brand: {product.brand}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={exportProductDetails}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={printProductDetails}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleDuplicate}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <Link 
                href={`/products/edit/${productId}`}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm"
              >
                <Edit className="w-4 h-4" />
                Edit Product
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content - Mobile View */}
        <div className="lg:hidden">
          <div className="p-4">
            {/* Product Image Carousel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
              <div className="relative">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
                  {images.length > 0 ? (
                    <img 
                      src={images[activeImage]} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onClick={() => setShowImageModal(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                </div>
                
                {images.length > 0 && (
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
                  >
                    <Maximize2 className="w-4 h-4 text-white" />
                  </button>
                )}
                
                {/* Thumbnail Dots */}
                {images.length > 1 && (
                  <div className="flex justify-center gap-1.5 mt-3">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImage(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          activeImage === index ? 'bg-emerald-500 w-6' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Quick Actions Row */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                <button
                  onClick={() => router.push(`/orders/new?product=${productId}`)}
                  className="flex flex-col items-center justify-center p-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                  title="Sell"
                >
                  <ShoppingCart className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="text-xs font-medium text-emerald-700">Sell</span>
                </button>
                <button
                  onClick={() => {
                    const newStock = prompt(`Add stock for ${product.name}:`, "10");
                    if (newStock && !isNaN(Number(newStock))) {
                      updateStock(product.stock + parseInt(newStock));
                    }
                  }}
                  className="flex flex-col items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Add Stock"
                >
                  <PackagePlus className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-xs font-medium text-blue-700">Stock</span>
                </button>
                <button
                  onClick={shareProductDetails}
                  className="flex flex-col items-center justify-center p-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  title="Share"
                >
                  <Share2 className="w-5 h-5 text-purple-600 mb-1" />
                  <span className="text-xs font-medium text-purple-700">Share</span>
                </button>
                <button
                  onClick={toggleProductStatus}
                  className="flex flex-col items-center justify-center p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Toggle Status"
                >
                  <div className={`w-8 h-5 rounded-full flex items-center p-0.5 mb-1 ${
                    product.isActive ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                      product.isActive ? 'translate-x-3' : ''
                    }`}></div>
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    {product.isActive ? 'On' : 'Off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Mobile Tabs */}
            <div className="mb-4">
              <div className="flex border-b border-gray-200">
                {[
                  { id: 'details', label: 'Details', icon: FileText },
                  { id: 'pricing', label: 'Pricing', icon: IndianRupee },
                  { id: 'inventory', label: 'Stock', icon: Layers },
                  { id: 'history', label: 'History', icon: Clock }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex flex-col items-center py-2 border-b-2 transition-colors ${
                      activeTab === tab.id 
                        ? 'border-emerald-500 text-emerald-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Tab Content */}
            <div className="mb-4">
              <MobileTabContent />
            </div>

            {/* Supplier Info (if available) */}
            {product.supplier && (product.supplier.name || product.supplier.contact) && (
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Supplier
                </h3>
                <div className="space-y-2">
                  {product.supplier.name && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-800 text-sm">{product.supplier.name}</span>
                    </div>
                  )}
                  {product.supplier.contact && (
                    <a 
                      href={`tel:${product.supplier.contact}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{product.supplier.contact}</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Sales Performance (if available) */}
            {product.totalSold !== undefined && (
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  Sales Performance
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-600 text-xs">Total Sold</p>
                    <p className="font-bold text-gray-800 text-lg">{product.totalSold}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <p className="text-emerald-600 text-xs">Revenue</p>
                    <p className="font-bold text-gray-800 text-lg">₹{product.revenueGenerated?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone - Mobile */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-20">
              <h3 className="text-red-800 font-semibold mb-3">Danger Zone</h3>
              
              {showDeleteConfirm ? (
                <div className="space-y-3">
                  <p className="text-sm text-red-700">
                    Delete "{product.name}"? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors text-sm"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Product
                </button>
              )}
            </div>
          </div>

          {/* Mobile Floating Action Button */}
          <div className="fixed bottom-20 right-4 z-50 lg:hidden">
            <Link
              href={`/products/edit/${productId}`}
              className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl transition-all active:scale-95"
            >
              <Edit className="w-6 h-6 text-white" />
            </Link>
          </div>
        </div>

        {/* Main Content - Desktop View */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Left Column - Product Images & Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Images */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Images</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Image */}
                <div>
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4 relative group">
                    {images.length > 0 ? (
                      <>
                        <img 
                          src={images[activeImage]} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={() => setShowImageModal(true)}
                          className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Maximize2 className="w-4 h-4 text-white" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-20 h-20 text-gray-300" />
                      </div>
                    )}
                  </div>
                  
                  {/* Thumbnail Images */}
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImage(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                            activeImage === index ? 'border-emerald-500' : 'border-transparent hover:border-gray-300'
                          }`}
                        >
                          <img 
                            src={img} 
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Quick Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={toggleProductStatus}
                          className={`relative w-12 h-6 rounded-full flex items-center cursor-pointer transition-colors ${
                            product.isActive ? 'bg-emerald-500' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                            product.isActive ? 'translate-x-7' : 'translate-x-1'
                          }`}></div>
                        </button>
                        <span className={`font-medium text-sm ${product.isActive ? 'text-emerald-600' : 'text-gray-600'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Featured</p>
                      <div className="mt-1">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${product.isFeatured ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                          <Star className="w-4 h-4" />
                          {product.isFeatured ? 'Featured' : 'Regular'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Stock Information</p>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Current Stock</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">{product.stock} {product.unit}</span>
                          <button
                            onClick={() => {
                              const newStock = prompt(`Update stock for ${product.name}:`, product.stock.toString());
                              if (newStock && !isNaN(Number(newStock))) {
                                updateStock(parseInt(newStock));
                              }
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Update Stock"
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${stockStatus.bg.replace('bg-', 'bg-').replace('-100', '-500')}`}
                          style={{ 
                            width: `${Math.min((product.stock / (product.minStockLevel * 3)) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Min: {product.minStockLevel}</span>
                        {product.maxStockLevel && (
                          <span className="text-gray-600">Max: {product.maxStockLevel}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Reorder Information</p>
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-800">Reorder Level: {product.reorderLevel} {product.unit}</span>
                        </div>
                        {product.stock <= product.reorderLevel && (
                          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            Order Now
                          </button>
                        )}
                      </div>
                      {product.supplier?.name && (
                        <p className="text-xs text-gray-600 mt-2">Supplier: {product.supplier.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Description</h2>
              
              {product.description ? (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No description available</p>
                </div>
              )}
            </div>

            {/* Sales & Performance */}
            {product.totalSold !== undefined && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  Sales Performance
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Sold</p>
                    <p className="text-2xl font-bold text-gray-800">{product.totalSold} {product.unit}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <p className="text-sm text-emerald-600">Revenue Generated</p>
                    <p className="text-2xl font-bold text-gray-800">₹{product.revenueGenerated?.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600">Avg. Monthly Sales</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {product.totalSold > 0 ? Math.round(product.totalSold / 12) : 0} {product.unit}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-orange-600">Last Sold</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {product.lastSoldAt ? formatDate(product.lastSoldAt) : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details & Actions */}
          <div className="space-y-6">
            {/* Pricing Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
                Pricing Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cost Price</span>
                  <span className="font-bold text-gray-800">₹{product.costPrice}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Selling Price</span>
                  <span className="font-bold text-2xl text-emerald-600">₹{product.price}</span>
                </div>
                
                {product.mrp && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">MRP</span>
                    <span className="font-medium text-gray-800 line-through">₹{product.mrp}</span>
                  </div>
                )}
                
                {product.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-bold text-red-600">{product.discount}%</span>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Margin</span>
                    <div className="text-right">
                      <p className={`font-bold text-xl ${margin.percentage > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {margin.percentage.toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">₹{margin.amount.toFixed(2)} per unit</p>
                    </div>
                  </div>
                  
                  {margin.percentage > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-emerald-600">
                        You earn ₹{margin.amount.toFixed(2)} on each sale
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Specifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                Specifications
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">SKU</span>
                  <span className="font-medium text-gray-800">{product.sku}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Barcode</span>
                  <span className="font-medium text-gray-800">{product.barcode || "Not specified"}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-gray-800">{product.category}</span>
                </div>
                
                {product.subcategory && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subcategory</span>
                    <span className="font-medium text-gray-800">{product.subcategory}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Unit</span>
                  <span className="font-medium text-gray-800">{product.unit}</span>
                </div>
                
                {product.weight && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight</span>
                    <span className="font-medium text-gray-800">{product.weight} kg</span>
                  </div>
                )}
                
                {product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height) && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dimensions</span>
                    <span className="font-medium text-gray-800">
                      {product.dimensions.length || 0} × {product.dimensions.width || 0} × {product.dimensions.height || 0} cm
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax Rate</span>
                  <span className="font-medium text-gray-800">{product.taxRate}%</span>
                </div>
              </div>
            </div>

            {/* Supplier Information */}
            {product.supplier && (product.supplier.name || product.supplier.contact || product.supplier.email) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  Supplier Information
                </h2>
                
                <div className="space-y-3">
                  {product.supplier.name && (
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-800">{product.supplier.name}</span>
                    </div>
                  )}
                  
                  {product.supplier.contact && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${product.supplier.contact}`} className="text-blue-600 hover:underline">
                        {product.supplier.contact}
                      </a>
                    </div>
                  )}
                  
                  {product.supplier.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${product.supplier.email}`} className="text-blue-600 hover:underline">
                        {product.supplier.email}
                      </a>
                    </div>
                  )}
                  
                  <button className="w-full mt-4 py-2 border-2 border-emerald-500 text-emerald-600 font-medium rounded-lg hover:bg-emerald-50 transition-colors text-sm">
                    Contact Supplier
                  </button>
                </div>
              </div>
            )}

            {/* Product History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Product History
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">{formatDate(product.createdAt)}</p>
                    <p className="text-sm text-gray-500">{formatTime(product.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">{formatDate(product.updatedAt)}</p>
                    <p className="text-sm text-gray-500">{formatTime(product.updatedAt)}</p>
                  </div>
                </div>
                
                {product.createdBy && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created By</span>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">{product.createdBy.name}</p>
                      <p className="text-sm text-gray-500">{product.createdBy.email}</p>
                    </div>
                  </div>
                )}
                
                <button className="w-full mt-2 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm">
                  <RefreshCw className="w-4 h-4" />
                  View Full History
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h2>
              
              <div className="space-y-3">
                <p className="text-sm text-red-600">
                  Once you delete a product, there is no going back. Please be certain.
                </p>
                
                {showDeleteConfirm ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-red-700">
                      Are you sure you want to delete "{product.name}"?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleDelete}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors text-sm"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Product
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {showImageModal && images.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => setActiveImage((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => setActiveImage((prev) => (prev + 1) % images.length)}
              className="absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
            
            <div className="max-w-4xl max-h-[80vh] w-full">
              <img 
                src={images[activeImage]} 
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Thumbnail Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeImage === index ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions Footer - Desktop */}
        <div className="hidden lg:grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
          <button 
            onClick={() => {
              router.push(`/orders/new?product=${productId}`);
            }}
            className="bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-xl p-4 flex flex-col items-center justify-center transition-all group"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
              <ShoppingBag className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="font-medium text-gray-700 text-sm">Sell This Product</span>
          </button>
          
          <button 
            onClick={() => {
              const newStock = prompt(`Add stock for ${product.name}:`, "10");
              if (newStock && !isNaN(Number(newStock))) {
                updateStock(product.stock + parseInt(newStock));
              }
            }}
            className="bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl p-4 flex flex-col items-center justify-center transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
              <Layers className="w-6 h-6 text-blue-600" />
            </div>
            <span className="font-medium text-gray-700 text-sm">Add Stock</span>
          </button>
          
          <Link 
            href={`/products/edit/${productId}`}
            className="bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 rounded-xl p-4 flex flex-col items-center justify-center transition-all group"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
              <Edit className="w-6 h-6 text-orange-600" />
            </div>
            <span className="font-medium text-gray-700 text-sm">Edit Details</span>
          </Link>
          
          <button 
            onClick={exportProductDetails}
            className="bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl p-4 flex flex-col items-center justify-center transition-all group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
            <span className="font-medium text-gray-700 text-sm">Export Details</span>
          </button>
        </div>
      </main>
    </div>
  );
}