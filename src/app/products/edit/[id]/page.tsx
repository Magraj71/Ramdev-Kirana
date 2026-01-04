"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Package, 
  Tag, 
  IndianRupee, 
  Layers,
  AlertTriangle,
  X,
  Check,
  Plus,
  Trash2,
  Camera,
  Hash,
  Grid,
  Scale,
  Box,
  Eye,
  Copy,
  History,
  RefreshCw
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
}

// Product units
const UNITS = [
  { value: "piece", label: "Piece" },
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "l", label: "Liter (l)" },
  { value: "ml", label: "Milliliter (ml)" },
  { value: "dozen", label: "Dozen" },
  { value: "pack", label: "Pack" },
  { value: "bottle", label: "Bottle" },
  { value: "box", label: "Box" },
  { value: "packet", label: "Packet" }
];

// Categories
const CATEGORIES = [
  "Grocery",
  "Dairy Products",
  "Beverages",
  "Snacks",
  "Personal Care",
  "Household",
  "Stationery",
  "Medicines",
  "Fresh Vegetables",
  "Fruits",
  "Spices",
  "Packed Food",
  "Instant Food",
  "Cooking Oil",
  "Flour & Grains",
  "Cleaning Supplies",
  "Baby Care",
  "Pet Care"
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    subcategory: "",
    brand: "",
    barcode: "",
    description: "",
    price: "",
    costPrice: "",
    mrp: "",
    discount: "0",
    taxRate: "0",
    stock: "",
    minStockLevel: "10",
    maxStockLevel: "",
    unit: "piece",
    weight: "",
    dimensions: {
      length: "",
      width: "",
      height: ""
    },
    supplier: {
      name: "",
      contact: "",
      email: ""
    },
    reorderLevel: "5",
    isActive: true,
    isFeatured: false
  });

  // Fetch product data
  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // src/app/products/edit/[id]/page.tsx में fetchProduct function
const fetchProduct = async () => {
  try {
    setLoading(true);
    console.log("🟡 Fetching product with ID:", productId);
    
    const response = await fetch(`/api/products/${productId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    
    console.log("🟡 Response status:", response.status);
    
    const data = await response.json();
    console.log("🟡 API Response data:", data);
    
    if (data.success) {
      setProduct(data.product);
      setImage(data.product.image || null);
      setAdditionalImages(data.product.images || []);
      
      // Populate form with product data
      setFormData({
        name: data.product.name || "",
        sku: data.product.sku || "",
        category: data.product.category || "",
        subcategory: data.product.subcategory || "",
        brand: data.product.brand || "",
        barcode: data.product.barcode || "",
        description: data.product.description || "",
        price: data.product.price?.toString() || "",
        costPrice: data.product.costPrice?.toString() || "",
        mrp: data.product.mrp?.toString() || "",
        discount: data.product.discount?.toString() || "0",
        taxRate: data.product.taxRate?.toString() || "0",
        stock: data.product.stock?.toString() || "",
        minStockLevel: data.product.minStockLevel?.toString() || "10",
        maxStockLevel: data.product.maxStockLevel?.toString() || "",
        unit: data.product.unit || "piece",
        weight: data.product.weight?.toString() || "",
        dimensions: {
          length: data.product.dimensions?.length?.toString() || "",
          width: data.product.dimensions?.width?.toString() || "",
          height: data.product.dimensions?.height?.toString() || ""
        },
        supplier: {
          name: data.product.supplier?.name || "",
          contact: data.product.supplier?.contact || "",
          email: data.product.supplier?.email || ""
        },
        reorderLevel: data.product.reorderLevel?.toString() || "5",
        isActive: data.product.isActive ?? true,
        isFeatured: data.product.isFeatured ?? false
      });
    } else {
      throw new Error(data.message || "Failed to fetch product");
    }
  } catch (error) {
    console.error("🔴 Error fetching product:", error);
    alert("Failed to load product. Please try again.");
    router.push("/products");
  } finally {
    setLoading(false);
  }
};

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle additional images
  const handleAdditionalImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdditionalImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove additional image
  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate selling price from MRP and discount
  const calculatePriceFromMRP = () => {
    if (formData.mrp && formData.discount) {
      const mrp = parseFloat(formData.mrp);
      const discount = parseFloat(formData.discount);
      const price = mrp - (mrp * discount / 100);
      setFormData(prev => ({ ...prev, price: price.toString() }));
    }
  };

  // Calculate margin
  const calculateMargin = () => {
    if (formData.price && formData.costPrice) {
      const price = parseFloat(formData.price);
      const cost = parseFloat(formData.costPrice);
      if (cost > 0) {
        return ((price - cost) / cost) * 100;
      }
    }
    return 0;
  };

  // Validate form
  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.name.trim()) errors.push("Product name is required");
    if (!formData.category) errors.push("Category is required");
    if (!formData.price) errors.push("Price is required");
    if (!formData.costPrice) errors.push("Cost price is required");
    if (!formData.stock) errors.push("Stock is required");
    if (!formData.unit) errors.push("Unit is required");

    const price = parseFloat(formData.price);
    const cost = parseFloat(formData.costPrice);
    if (price && cost && price < cost) {
      errors.push("Selling price cannot be less than cost price");
    }

    return errors;
  };

  // Handle form submission
  // src/app/products/edit/[id]/page.tsx में
// handleSubmit function को update करें:

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const errors = validateForm();
  if (errors.length > 0) {
    alert(errors.join("\n"));
    return;
  }

  try {
    setSaving(true);

    // ✅ Prepare clean data
    const productData: any = {
      name: formData.name.trim(),
      sku: formData.sku.trim().toUpperCase(),
      category: formData.category,
      price: parseFloat(formData.price),
      costPrice: parseFloat(formData.costPrice),
      stock: parseInt(formData.stock) || 0,
      minStockLevel: parseInt(formData.minStockLevel) || 10,
      unit: formData.unit,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured
    };

    // ✅ Add optional fields
    if (formData.subcategory !== undefined) productData.subcategory = formData.subcategory.trim();
    if (formData.brand !== undefined) productData.brand = formData.brand.trim();
    if (formData.barcode !== undefined) productData.barcode = formData.barcode.trim();
    if (formData.description !== undefined) productData.description = formData.description.trim();
    if (formData.mrp !== undefined) productData.mrp = parseFloat(formData.mrp);
    if (formData.discount !== undefined) productData.discount = parseFloat(formData.discount);
    if (formData.taxRate !== undefined) productData.taxRate = parseFloat(formData.taxRate);
    if (formData.maxStockLevel !== undefined) productData.maxStockLevel = parseInt(formData.maxStockLevel);
    if (formData.weight !== undefined) productData.weight = parseFloat(formData.weight);
    if (formData.reorderLevel !== undefined) productData.reorderLevel = parseInt(formData.reorderLevel);
    if (image !== undefined) productData.image = image;
    if (additionalImages !== undefined) productData.images = additionalImages;
    
    // ✅ Handle dimensions
    if (formData.dimensions) {
      productData.dimensions = {};
      if (formData.dimensions.length !== undefined) productData.dimensions.length = parseFloat(formData.dimensions.length);
      if (formData.dimensions.width !== undefined) productData.dimensions.width = parseFloat(formData.dimensions.width);
      if (formData.dimensions.height !== undefined) productData.dimensions.height = parseFloat(formData.dimensions.height);
    }
    
    // ✅ Handle supplier
    if (formData.supplier) {
      productData.supplier = {};
      if (formData.supplier.name !== undefined) productData.supplier.name = formData.supplier.name.trim();
      if (formData.supplier.contact !== undefined) productData.supplier.contact = formData.supplier.contact.trim();
      if (formData.supplier.email !== undefined) productData.supplier.email = formData.supplier.email.trim();
    }

    console.log("🟡 Sending update data:", productData);

    const response = await fetch(`/api/products/${productId}`, {
      method: "PUT", // ✅ PUT method use करें
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData)
    });

    const data = await response.json();
    console.log("🟡 API Response:", data);

    if (data.success) {
      alert("Product updated successfully!");
      router.push("/products");
    } else {
      throw new Error(data.message || "Failed to update product");
    }
  } catch (error: any) {
    console.error("🔴 Error updating product:", error);
    alert(`Failed to update product: ${error.message}`);
  } finally {
    setSaving(false);
  }
};

  // Duplicate product
  const handleDuplicate = async () => {
    if (!product) return;
    
    if (!confirm("Create a duplicate of this product?")) return;

    try {
      const duplicateData = {
        ...formData,
        name: `${formData.name} (Copy)`,
        sku: `${formData.sku}-COPY`,
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice),
        mrp: formData.mrp ? parseFloat(formData.mrp) : undefined,
        discount: parseFloat(formData.discount),
        taxRate: parseFloat(formData.taxRate),
        stock: parseInt(formData.stock),
        minStockLevel: parseInt(formData.minStockLevel),
        maxStockLevel: formData.maxStockLevel ? parseInt(formData.maxStockLevel) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        reorderLevel: parseInt(formData.reorderLevel),
        image,
        images: additionalImages,
        dimensions: {
          length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : undefined,
          width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : undefined,
          height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : undefined
        },
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

  // View product history (placeholder)
  const viewHistory = () => {
    alert("Product history feature coming soon!");
  };

  const margin = calculateMargin();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
        <Navbar />
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
        <Navbar />
        <div className="p-6">
          <div className="bg-white rounded-xl p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <Navbar />
      
      <main className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <Link 
              href="/products"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Edit Product</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">SKU: {product.sku}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">Last updated: {new Date(product.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Link 
              href={`/products/${productId}`}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Details
            </Link>
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              {showAdvanced ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  Advanced View
                </>
              ) : (
                <>
                  <Grid className="w-4 h-4 text-gray-600" />
                  Advanced Options
                </>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  Product Information
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Sugar 5kg Premium"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU (Stock Keeping Unit) *
                      </label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        placeholder="e.g., SUG-5KG-PRM"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
                        required
                      >
                        <option value="">Select Category</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subcategory
                      </label>
                      <input
                        type="text"
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleChange}
                        placeholder="e.g., Refined Sugar"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        placeholder="e.g., Tata, Patanjali"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Barcode
                      </label>
                      <input
                        type="text"
                        name="barcode"
                        value={formData.barcode}
                        onChange={handleChange}
                        placeholder="e.g., 8901234567890"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Enter product description..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-emerald-600" />
                  Pricing Information
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost Price *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          name="costPrice"
                          value={formData.costPrice}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selling Price *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Margin
                      </label>
                      <div className={`px-4 py-2.5 border rounded-lg font-bold text-center ${
                        margin > 0 
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : margin < 0
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      }`}>
                        {margin.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {showAdvanced && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          MRP (Maximum Retail Price)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                          <input
                            type="number"
                            name="mrp"
                            value={formData.mrp}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          name="discount"
                          value={formData.discount}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="0"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tax Rate (%)
                        </label>
                        <input
                          type="number"
                          name="taxRate"
                          value={formData.taxRate}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="0"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={calculatePriceFromMRP}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Calculate from MRP & Discount
                    </button>
                  </div>
                </div>
              </div>

              {/* Inventory Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  Inventory Information
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Stock *
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit *
                      </label>
                      <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
                        required
                      >
                        {UNITS.map(unit => (
                          <option key={unit.value} value={unit.value}>{unit.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Stock Level *
                      </label>
                      <input
                        type="number"
                        name="minStockLevel"
                        value={formData.minStockLevel}
                        onChange={handleChange}
                        min="0"
                        placeholder="10"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Stock Level
                      </label>
                      <input
                        type="number"
                        name="maxStockLevel"
                        value={formData.maxStockLevel}
                        onChange={handleChange}
                        min="0"
                        placeholder="Optional"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reorder Level
                      </label>
                      <input
                        type="number"
                        name="reorderLevel"
                        value={formData.reorderLevel}
                        onChange={handleChange}
                        min="0"
                        placeholder="5"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="e.g., 5.00"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {showAdvanced && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Box className="w-5 h-5 text-emerald-600" />
                    Additional Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dimensions (cm)
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="number"
                          name="dimensions.length"
                          value={formData.dimensions.length}
                          onChange={handleChange}
                          placeholder="Length"
                          className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <input
                          type="number"
                          name="dimensions.width"
                          value={formData.dimensions.width}
                          onChange={handleChange}
                          placeholder="Width"
                          className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <input
                          type="number"
                          name="dimensions.height"
                          value={formData.dimensions.height}
                          onChange={handleChange}
                          placeholder="Height"
                          className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supplier Information
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          name="supplier.name"
                          value={formData.supplier.name}
                          onChange={handleChange}
                          placeholder="Supplier Name"
                          className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          name="supplier.contact"
                          value={formData.supplier.contact}
                          onChange={handleChange}
                          placeholder="Contact Number"
                          className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <input
                          type="email"
                          name="supplier.email"
                          value={formData.supplier.email}
                          onChange={handleChange}
                          placeholder="Email Address"
                          className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Image & Actions */}
            <div className="space-y-6">
              {/* Product Image Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-600" />
                  Product Images
                </h2>
                
                <div className="space-y-4">
                  {/* Main Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Image
                    </label>
                    <div className="mb-3">
                      {image ? (
                        <div className="relative">
                          <img 
                            src={image} 
                            alt="Product" 
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setImage(null)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
                            <Upload className="w-12 h-12 text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500">Upload Main Image</p>
                            <p className="text-xs text-gray-400 mt-1">Recommended: 500x500px</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Additional Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Images
                    </label>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {additionalImages.map((img, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={img} 
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      
                      {additionalImages.length < 6 && (
                        <label className="cursor-pointer">
                          <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
                            <Plus className="w-6 h-6 text-gray-400" />
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleAdditionalImages}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {additionalImages.length}/6 images uploaded
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Status Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Status</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">Active Product</p>
                      <p className="text-sm text-gray-600">Product will be visible to customers</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <label 
                        htmlFor="isActive"
                        className={`w-12 h-6 rounded-full flex items-center cursor-pointer transition-colors ${
                          formData.isActive ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                          formData.isActive ? 'translate-x-7' : 'translate-x-1'
                        }`}></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">Featured Product</p>
                      <p className="text-sm text-gray-600">Highlight this product</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <label 
                        htmlFor="isFeatured"
                        className={`w-12 h-6 rounded-full flex items-center cursor-pointer transition-colors ${
                          formData.isFeatured ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                          formData.isFeatured ? 'translate-x-7' : 'translate-x-1'
                        }`}></div>
                      </label>
                    </div>
                  </div>

                  {/* Stock Status Preview */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="font-medium text-gray-800 mb-2">Stock Status Preview</p>
                    {formData.stock && formData.minStockLevel && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Current Stock</span>
                          <span className="font-medium">{formData.stock} {formData.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Minimum Level</span>
                          <span className="font-medium">{formData.minStockLevel} {formData.unit}</span>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-600">Stock Status</span>
                            <span className={`text-sm font-medium ${
                              !formData.stock || parseInt(formData.stock) === 0 
                                ? 'text-red-600'
                                : parseInt(formData.stock) < parseInt(formData.minStockLevel)
                                ? 'text-orange-600'
                                : 'text-emerald-600'
                            }`}>
                              {!formData.stock || parseInt(formData.stock) === 0 
                                ? 'Out of Stock'
                                : parseInt(formData.stock) < parseInt(formData.minStockLevel)
                                ? 'Low Stock'
                                : 'In Stock'}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                !formData.stock || parseInt(formData.stock) === 0 
                                  ? 'bg-red-500 w-0'
                                  : parseInt(formData.stock) < parseInt(formData.minStockLevel)
                                  ? 'bg-orange-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ 
                                width: `${Math.min((parseInt(formData.stock) / (parseInt(formData.minStockLevel) * 3)) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions</h2>
                
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Update Product
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <Link 
                      href="/products"
                      className="block w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-xl transition-colors text-center"
                    >
                      Cancel
                    </Link>
                    
                    <button
                      type="button"
                      onClick={viewHistory}
                      className="w-full border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-blue-600 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <History className="w-4 h-4" />
                      History
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={fetchProduct}
                    className="w-full border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-600 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}