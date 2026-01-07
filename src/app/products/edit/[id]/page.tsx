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
  RefreshCw,
  Menu,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minus,
  Smartphone,
  Monitor,
  Tablet,
  QrCode,
  Barcode,
  Calculator,
  AlertCircle,
  Percent,
  Package2
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
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'inventory' | 'media'>('basic');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
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

  // Close mobile menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showMobileMenu && !target.closest('.mobile-menu')) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/products/${productId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      
      const data = await response.json();
      
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
      console.error("Error fetching product:", error);
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
      setFormData(prev => ({ ...prev, price: price.toFixed(2) }));
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
      setSaving(true);

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
      
      if (formData.dimensions) {
        productData.dimensions = {};
        if (formData.dimensions.length !== undefined) productData.dimensions.length = parseFloat(formData.dimensions.length);
        if (formData.dimensions.width !== undefined) productData.dimensions.width = parseFloat(formData.dimensions.width);
        if (formData.dimensions.height !== undefined) productData.dimensions.height = parseFloat(formData.dimensions.height);
      }
      
      if (formData.supplier) {
        productData.supplier = {};
        if (formData.supplier.name !== undefined) productData.supplier.name = formData.supplier.name.trim();
        if (formData.supplier.contact !== undefined) productData.supplier.contact = formData.supplier.contact.trim();
        if (formData.supplier.email !== undefined) productData.supplier.email = formData.supplier.email.trim();
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });

      const data = await response.json();

      if (data.success) {
        alert("Product updated successfully!");
        router.push("/products");
      } else {
        throw new Error(data.message || "Failed to update product");
      }
    } catch (error: any) {
      console.error("Error updating product:", error);
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

  // View product history
  const viewHistory = () => {
    alert("Product history feature coming soon!");
  };

  // Calculate stock status color
  const getStockStatusColor = () => {
    if (!formData.stock || parseInt(formData.stock) === 0) return 'text-red-600 bg-red-100';
    if (parseInt(formData.stock) < parseInt(formData.minStockLevel)) return 'text-orange-600 bg-orange-100';
    return 'text-emerald-600 bg-emerald-100';
  };

  // Get stock status text
  const getStockStatusText = () => {
    if (!formData.stock || parseInt(formData.stock) === 0) return 'Out of Stock';
    if (parseInt(formData.stock) < parseInt(formData.minStockLevel)) return 'Low Stock';
    return 'In Stock';
  };

  const margin = calculateMargin();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
        <Navbar />
        <div className="p-4 flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-600">Loading product...</p>
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

  // Mobile Tab Content
  const MobileTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Sugar 5kg Premium"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU *
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder="SUG-5KG-PRM"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm appearance-none"
                      required
                    >
                      <option value="">Select</option>
                      {CATEGORIES.slice(0, 8).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      {CATEGORIES.length > 8 && <option value="more">More...</option>}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="e.g., Tata, Patanjali"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Enter product description..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className="w-full bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-gray-800">Pricing Information</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Pricing</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                      <input
                        type="number"
                        name="costPrice"
                        value={formData.costPrice}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selling Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Profit Margin</span>
                    <span className={`font-bold ${margin > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {margin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    ₹{(parseFloat(formData.price) - parseFloat(formData.costPrice)).toFixed(2)} per unit
                  </div>
                </div>

                {showAdvanced && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          MRP
                        </label>
                        <input
                          type="number"
                          name="mrp"
                          value={formData.mrp}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount %
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
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className="w-full bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-gray-800">Inventory</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Inventory</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm appearance-none"
                      required
                    >
                      {UNITS.map(unit => (
                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Level *
                    </label>
                    <input
                      type="number"
                      name="minStockLevel"
                      value={formData.minStockLevel}
                      onChange={handleChange}
                      min="0"
                      placeholder="10"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reorder Level
                    </label>
                    <input
                      type="number"
                      name="reorderLevel"
                      value={formData.reorderLevel}
                      onChange={handleChange}
                      min="0"
                      placeholder="5"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Stock Status Preview */}
                {formData.stock && formData.minStockLevel && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-800">Stock Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor()}`}>
                        {getStockStatusText()}
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
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className="w-full bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-gray-800">Product Images</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        );

      case 'media':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Product Images</h3>
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
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setImage(null)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
                          <Upload className="w-10 h-10 text-gray-300 mb-2" />
                          <p className="text-sm text-gray-500">Tap to upload</p>
                          <p className="text-xs text-gray-400 mt-1">500x500px recommended</p>
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
                    Additional Images ({additionalImages.length}/6)
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {additionalImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={img} 
                          alt={`Product ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      </div>
                    ))}
                    
                    {additionalImages.length < 6 && (
                      <label className="cursor-pointer">
                        <div className="w-full h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
                          <Plus className="w-5 h-5 text-gray-400" />
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
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <Navbar />
      
      <main className="max-w-6xl mx-auto">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
          <div className="p-3 flex items-center justify-between">
            <Link 
              href="/products"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            
            <div className="flex-1 px-3 min-w-0">
              <h1 className="font-bold text-gray-800 truncate text-sm">Edit Product</h1>
              <p className="text-xs text-gray-500 truncate">{product.sku}</p>
            </div>
            
            <div className="relative mobile-menu">
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              
              {showMobileMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link 
                    href={`/products/${productId}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">View Details</span>
                  </Link>
                  <button
                    onClick={handleDuplicate}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 w-full"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">Duplicate</span>
                  </button>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 w-full"
                  >
                    <Grid className="w-4 h-4" />
                    <span className="text-sm">
                      {showAdvanced ? 'Hide Advanced' : 'Advanced Options'}
                    </span>
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() => {
                      if (confirm("Reset all changes?")) {
                        fetchProduct();
                        setShowMobileMenu(false);
                      }
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 w-full"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="text-sm">Reset Changes</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="px-3 pb-2">
            <div className="flex overflow-x-auto scrollbar-hide">
              {[
                { id: 'basic', label: 'Basic', icon: Package },
                { id: 'pricing', label: 'Pricing', icon: IndianRupee },
                { id: 'inventory', label: 'Stock', icon: Layers },
                { id: 'media', label: 'Images', icon: Camera }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-shrink-0 flex flex-col items-center py-2 px-3 border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? 'border-emerald-500 text-emerald-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mb-1" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
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
                  <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
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
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                View Details
              </Link>
              <button
                onClick={handleDuplicate}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm"
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
        </div>

        {/* Mobile Form */}
        <div className="lg:hidden">
          <form onSubmit={handleSubmit} className="p-3 pb-24">
            <MobileTabContent />

            {/* Product Status - Mobile */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mt-4">
              <h3 className="font-semibold text-gray-800 mb-3">Product Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Active</p>
                    <p className="text-xs text-gray-600">Visible to customers</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="isActiveMobile"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <label 
                      htmlFor="isActiveMobile"
                      className={`w-10 h-5 rounded-full flex items-center cursor-pointer transition-colors ${
                        formData.isActive ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                        formData.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Featured</p>
                    <p className="text-xs text-gray-600">Highlight product</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="isFeaturedMobile"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <label 
                      htmlFor="isFeaturedMobile"
                      className={`w-10 h-5 rounded-full flex items-center cursor-pointer transition-colors ${
                        formData.isFeatured ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                        formData.isFeatured ? 'translate-x-6' : 'translate-x-1'
                      }`}></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Options Toggle - Mobile */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full mt-4 bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-800">
                  {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
                </span>
              </div>
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {/* Advanced Options - Mobile */}
            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Tax & MRP</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Rate %
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
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Stock
                      </label>
                      <input
                        type="number"
                        name="maxStockLevel"
                        value={formData.maxStockLevel}
                        onChange={handleChange}
                        min="0"
                        placeholder="Optional"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Dimensions & Weight</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dimensions (cm)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          name="dimensions.length"
                          value={formData.dimensions.length}
                          onChange={handleChange}
                          placeholder="L"
                          className="w-full px-2 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                        <input
                          type="number"
                          name="dimensions.width"
                          value={formData.dimensions.width}
                          onChange={handleChange}
                          placeholder="W"
                          className="w-full px-2 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                        <input
                          type="number"
                          name="dimensions.height"
                          value={formData.dimensions.height}
                          onChange={handleChange}
                          placeholder="H"
                          className="w-full px-2 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="e.g., 5.00"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Mobile Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-lg z-40">
            <div className="flex gap-2">
              <Link 
                href="/products"
                className="flex-1 border-2 border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors text-center text-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Form */}
        <form onSubmit={handleSubmit} className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
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
        </form>
      </main>
    </div>
  );
}