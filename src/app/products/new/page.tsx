"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  ChevronDown,
  Smartphone,
  Tablet,
  Monitor
} from "lucide-react";

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

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check device type on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    subcategory: "",
    brand: "",
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
    isFeatured: false
  });

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

  // Generate SKU
  const generateSKU = () => {
    const prefix = "PRO";
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sku = `${prefix}-${random}`;
    setFormData(prev => ({ ...prev, sku }));
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Image size should be less than 5MB");
        return;
      }
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
    if (additionalImages.length + files.length > 6) {
      alert("Maximum 6 additional images allowed");
      return;
    }
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is larger than 5MB`);
        return;
      }
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    try {
      setLoading(true);

      const productData: any = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        category: formData.category,
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice),
        stock: parseInt(formData.stock) || 0,
        minStockLevel: parseInt(formData.minStockLevel) || 10,
        unit: formData.unit,
        isActive: true,
        isFeatured: formData.isFeatured
      };

      // Add optional fields if they have values
      if (formData.subcategory.trim()) productData.subcategory = formData.subcategory.trim();
      if (formData.brand.trim()) productData.brand = formData.brand.trim();
      if (formData.description.trim()) productData.description = formData.description.trim();
      if (formData.mrp) productData.mrp = parseFloat(formData.mrp);
      if (formData.discount) productData.discount = parseFloat(formData.discount);
      if (formData.taxRate) productData.taxRate = parseFloat(formData.taxRate);
      if (formData.maxStockLevel) productData.maxStockLevel = parseInt(formData.maxStockLevel);
      if (formData.weight) productData.weight = parseFloat(formData.weight);
      if (formData.reorderLevel) productData.reorderLevel = parseInt(formData.reorderLevel);
      if (image) productData.image = image;
      if (additionalImages.length > 0) productData.images = additionalImages;
      
      // Handle dimensions
      if (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) {
        productData.dimensions = {};
        if (formData.dimensions.length) productData.dimensions.length = parseFloat(formData.dimensions.length);
        if (formData.dimensions.width) productData.dimensions.width = parseFloat(formData.dimensions.width);
        if (formData.dimensions.height) productData.dimensions.height = parseFloat(formData.dimensions.height);
      }
      
      // Handle supplier
      if (formData.supplier.name || formData.supplier.contact || formData.supplier.email) {
        productData.supplier = {};
        if (formData.supplier.name) productData.supplier.name = formData.supplier.name.trim();
        if (formData.supplier.contact) productData.supplier.contact = formData.supplier.contact.trim();
        if (formData.supplier.email) productData.supplier.email = formData.supplier.email.trim();
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });

      const data = await response.json();

      if (data.success) {
        alert("Product created successfully!");
        router.push("/products");
      } else {
        throw new Error(data.message || "Failed to create product");
      }
    } catch (error: any) {
      console.error("Error creating product:", error);
      alert(`Failed to create product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const margin = calculateMargin();

  // Device indicator for testing (optional)
  const DeviceIndicator = () => (
    <div className="fixed bottom-4 right-4 z-10 flex items-center gap-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-full opacity-50 hover:opacity-100 transition-opacity">
      {isMobile ? (
        <Smartphone className="w-3 h-3" />
      ) : window.innerWidth < 1024 ? (
        <Tablet className="w-3 h-3" />
      ) : (
        <Monitor className="w-3 h-3" />
      )}
      <span>{isMobile ? "Mobile" : window.innerWidth < 1024 ? "Tablet" : "Desktop"}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <Navbar />
      
      <main className="p-3 sm:p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <Link 
              href="/products"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              Back to Products
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg sm:rounded-xl">
                <Package className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Add New Product</h1>
                <p className="text-gray-600 text-xs sm:text-sm">Fill in the details to add a new product to your inventory</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors text-xs sm:text-sm"
            >
              {showAdvanced ? (
                <>
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Advanced View</span>
                  <span className="sm:hidden">Advanced</span>
                </>
              ) : (
                <>
                  <Grid className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  <span className="hidden sm:inline">Advanced Options</span>
                  <span className="sm:hidden">More</span>
                </>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column - Basic Information */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Product Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  Product Information
                </h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Sugar 5kg Premium"
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        SKU (Stock Keeping Unit)
                      </label>
                      <div className="flex gap-1.5 sm:gap-2">
                        <input
                          type="text"
                          name="sku"
                          value={formData.sku}
                          onChange={handleChange}
                          placeholder="e.g., SUG-5KG-PRM"
                          className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                        />
                        <button
                          type="button"
                          onClick={generateSKU}
                          className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                        >
                          <Hash className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Generate</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Category *
                      </label>
                      <div className="relative">
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base appearance-none pr-10"
                          required
                        >
                          <option value="">Select Category</option>
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Subcategory
                      </label>
                      <input
                        type="text"
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleChange}
                        placeholder="e.g., Refined Sugar"
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Brand
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        placeholder="e.g., Tata, Patanjali"
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Barcode
                      </label>
                      <input
                        type="text"
                        name="barcode"
                        value={formData.sku}
                        onChange={handleChange}
                        placeholder="e.g., 8901234567890"
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Enter product description..."
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  Pricing Information
                </h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Cost Price *
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm sm:text-base">₹</span>
                        <input
                          type="number"
                          name="costPrice"
                          value={formData.costPrice}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2 sm:py-2.5 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Selling Price *
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm sm:text-base">₹</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2 sm:py-2.5 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                          required
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-1 lg:col-span-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Margin
                      </label>
                      <div className={`px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg font-bold text-center text-sm sm:text-base ${
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                          MRP
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm sm:text-base">₹</span>
                          <input
                            type="number"
                            name="mrp"
                            value={formData.mrp}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2 sm:py-2.5 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
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
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
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
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={calculatePriceFromMRP}
                      className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Calculate from MRP & Discount
                    </button>
                  </div>
                </div>
              </div>

              {/* Inventory Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  Inventory Information
                </h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Current Stock *
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Unit *
                      </label>
                      <div className="relative">
                        <select
                          name="unit"
                          value={formData.unit}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base appearance-none pr-10"
                          required
                        >
                          {UNITS.map(unit => (
                            <option key={unit.value} value={unit.value}>{unit.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Minimum Stock *
                      </label>
                      <input
                        type="number"
                        name="minStockLevel"
                        value={formData.minStockLevel}
                        onChange={handleChange}
                        min="0"
                        placeholder="10"
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Maximum Stock
                      </label>
                      <input
                        type="number"
                        name="maxStockLevel"
                        value={formData.maxStockLevel}
                        onChange={handleChange}
                        min="0"
                        placeholder="Optional"
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Reorder Level
                      </label>
                      <input
                        type="number"
                        name="reorderLevel"
                        value={formData.reorderLevel}
                        onChange={handleChange}
                        min="0"
                        placeholder="5"
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
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
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {showAdvanced && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <Box className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                    Additional Information
                  </h2>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Dimensions (cm)
                      </label>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <input
                          type="number"
                          name="dimensions.length"
                          value={formData.dimensions.length}
                          onChange={handleChange}
                          placeholder="Length"
                          className="px-2 sm:px-3 py-1.5 sm:py-2 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                        />
                        <input
                          type="number"
                          name="dimensions.width"
                          value={formData.dimensions.width}
                          onChange={handleChange}
                          placeholder="Width"
                          className="px-2 sm:px-3 py-1.5 sm:py-2 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                        />
                        <input
                          type="number"
                          name="dimensions.height"
                          value={formData.dimensions.height}
                          onChange={handleChange}
                          placeholder="Height"
                          className="px-2 sm:px-3 py-1.5 sm:py-2 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Supplier Information
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                        <input
                          type="text"
                          name="supplier.name"
                          value={formData.supplier.name}
                          onChange={handleChange}
                          placeholder="Supplier Name"
                          className="px-2 sm:px-3 py-1.5 sm:py-2 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                        />
                        <input
                          type="text"
                          name="supplier.contact"
                          value={formData.supplier.contact}
                          onChange={handleChange}
                          placeholder="Contact Number"
                          className="px-2 sm:px-3 py-1.5 sm:py-2 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                        />
                        <input
                          type="email"
                          name="supplier.email"
                          value={formData.supplier.email}
                          onChange={handleChange}
                          placeholder="Email Address"
                          className="px-2 sm:px-3 py-1.5 sm:py-2 border text-black border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Image & Actions */}
            <div className="space-y-4 sm:space-y-6">
              {/* Product Image Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  Product Images
                </h2>
                
                <div className="space-y-3 sm:space-y-4">
                  {/* Main Image */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Main Image
                    </label>
                    <div className="mb-2 sm:mb-3">
                      {image ? (
                        <div className="relative">
                          <img 
                            src={image} 
                            alt="Product" 
                            className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setImage(null)}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <div className="w-full h-32 sm:h-40 md:h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
                            <Upload className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-300 mb-1 sm:mb-2" />
                            <p className="text-xs sm:text-sm text-gray-500">Upload Main Image</p>
                            <p className="text-xs text-gray-400 mt-0.5 sm:mt-1 text-center px-2">Recommended: 500x500px • Max 5MB</p>
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
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Additional Images
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3">
                      {additionalImages.map((img, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={img} 
                            alt={`Product ${index + 1}`}
                            className="w-full h-16 sm:h-20 md:h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="absolute top-0.5 right-0.5 p-0.5 sm:p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-2 h-2 sm:w-3 sm:h-3" />
                          </button>
                        </div>
                      ))}
                      
                      {additionalImages.length < 6 && (
                        <label className="cursor-pointer">
                          <div className="w-full h-16 sm:h-20 md:h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400" />
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Product Status</h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm sm:text-base">Active Product</p>
                      <p className="text-xs sm:text-sm text-gray-600">Product will be visible to customers</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={true}
                        onChange={() => {}}
                        className="sr-only"
                        disabled
                      />
                      <label 
                        htmlFor="isActive"
                        className="w-10 sm:w-12 h-5 sm:h-6 bg-emerald-500 rounded-full flex items-center cursor-pointer"
                      >
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-md transform translate-x-5 sm:translate-x-7 transition-transform"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm sm:text-base">Featured Product</p>
                      <p className="text-xs sm:text-sm text-gray-600">Highlight this product</p>
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
                        className={`w-10 sm:w-12 h-5 sm:h-6 rounded-full flex items-center cursor-pointer transition-colors ${
                          formData.isFeatured ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-md transform transition-transform ${
                          formData.isFeatured ? 'translate-x-5 sm:translate-x-7' : 'translate-x-0.5 sm:translate-x-1'
                        }`}></div>
                      </label>
                    </div>
                  </div>

                  {/* Stock Status Preview */}
                  <div className="pt-3 sm:pt-4 border-t border-gray-100">
                    <p className="font-medium text-gray-800 mb-2 text-sm sm:text-base">Stock Status Preview</p>
                    {formData.stock && formData.minStockLevel && (
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs sm:text-sm text-gray-600">Current Stock</span>
                          <span className="font-medium text-sm sm:text-base">{formData.stock} {formData.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs sm:text-sm text-gray-600">Minimum Level</span>
                          <span className="font-medium text-sm sm:text-base">{formData.minStockLevel} {formData.unit}</span>
                        </div>
                        <div className="mt-2 sm:mt-3">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs sm:text-sm text-gray-600">Stock Status</span>
                            <span className={`text-xs sm:text-sm font-medium ${
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
                          <div className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Actions</h2>
                
                <div className="space-y-2 sm:space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                        Save Product
                      </>
                    )}
                  </button>

                  <Link 
                    href="/products"
                    className="block w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2.5 sm:py-3 rounded-xl transition-colors text-center text-sm sm:text-base"
                  >
                    Cancel
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        name: "",
                        sku: "",
                        category: "",
                        subcategory: "",
                        brand: "",
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
                        dimensions: { length: "", width: "", height: "" },
                        supplier: { name: "", contact: "", email: "" },
                        reorderLevel: "5",
                        isFeatured: false
                      });
                      setImage(null);
                      setAdditionalImages([]);
                    }}
                    className="w-full border-2 border-dashed border-gray-300 hover:border-red-300 hover:bg-red-50 text-red-600 font-medium py-2.5 sm:py-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    Clear All Fields
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
      
      {/* Device Indicator (optional - remove in production) */}
      {/* <DeviceIndicator /> */}
    </div>
  );
}