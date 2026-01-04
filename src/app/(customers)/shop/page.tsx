// src/app/shop/page.tsx (Complete redesign with improved cart layout)
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RefreshCw,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Package,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Tag,
  Percent,
  Clock,
  Heart,
  Share2,
  Eye,
  Star as StarIcon,
  CreditCard,
  Gift,
  ShieldCheck,
  Award,
  TrendingDown,
  Zap,
  ChevronDown,
  ChevronUp,
  Info,
  MapPin,
  Calendar,
  Wallet,
  Clock as ClockIcon,
  Shield as ShieldIcon,
  Leaf,
  Truck as TruckIcon,
  Package as PackageIcon,
  ArrowLeft,
  Check,
  Lock
} from "lucide-react";

// Product type for customer view
interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  mrp?: number;
  discount?: number;
  finalPrice: number;
  image?: string;
  images?: string[];
  description?: string;
  brand?: string;
  unit: string;
  inStock: boolean;
  stock: number;
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  finalPrice: number;
  quantity: number;
  image?: string;
  unit: string;
  maxQuantity: number;
  brand?: string;
  category?: string;
}

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [addedToCartId, setAddedToCartId] = useState<string | null>(null);
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [savings, setSavings] = useState(0);

  // Load cart from localStorage
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const cartData = JSON.parse(savedCart);
          const validatedCart = cartData.map((item: any) => ({
            productId: item.productId || '',
            name: item.name || '',
            price: item.price || 0,
            finalPrice: item.finalPrice || item.price || 0,
            quantity: item.quantity || 1,
            image: item.image || '',
            unit: item.unit || 'piece',
            maxQuantity: item.maxQuantity || item.stock || 10,
            brand: item.brand || '',
            category: item.category || ''
          }));
          setCart(validatedCart);
        }
      } catch (error) {
        console.error('Error parsing cart:', error);
        setCart([]);
      }
    };
    loadCart();
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  // Calculate savings from discounts
  useEffect(() => {
    const totalSavings = cart.reduce((total, item) => {
      const itemSavings = (item.price - item.finalPrice) * item.quantity;
      return total + Math.max(0, itemSavings);
    }, 0);
    setSavings(totalSavings);
  }, [cart]);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (selectedCategory !== "all") query.append("category", selectedCategory);
      if (searchQuery) query.append("search", searchQuery);
      query.append("sort", sortBy);
      query.append("page", page.toString());

      const response = await fetch(`/api/products/public?${query.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
        setCategories(data.categories || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, page]);

  // Add to cart with animation
  const addToCart = (product: Product) => {
    setAddedToCartId(product._id);
    
    setCart(prev => {
      const existingItem = prev.find(item => item.productId === product._id);
      
      if (existingItem) {
        if (existingItem.quantity >= existingItem.maxQuantity) {
          alert(`Only ${existingItem.maxQuantity} units available`);
          return prev;
        }
        
        return prev.map(item =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        const newCartItem: CartItem = {
          productId: product._id,
          name: product.name,
          price: product.price,
          finalPrice: product.finalPrice,
          quantity: 1,
          image: product.image,
          unit: product.unit,
          maxQuantity: product.stock,
          brand: product.brand,
          category: product.category
        };
        return [...prev, newCartItem];
      }
    });

    // Reset animation after 1.5 seconds
    setTimeout(() => setAddedToCartId(null), 1500);
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  // Update quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev =>
      prev.map(item => {
        if (item.productId === productId) {
          if (quantity > item.maxQuantity) {
            alert(`Only ${item.maxQuantity} units available`);
            return { ...item, quantity: item.maxQuantity };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  // Get cart totals
  const cartSubtotal = cart.reduce((total, item) => 
    total + (item.finalPrice * item.quantity), 0
  );
  
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
  
  const taxAmount = 0;
  const shippingCharge = cartSubtotal > 500 ? 0 : 0;
  const couponDiscount = appliedCoupon ? cartSubtotal * 0 : 0; // 10% discount for demo
  const cartTotal = Math.max(0, cartSubtotal + taxAmount + shippingCharge - couponDiscount);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }
    setIsCartOpen(false);
    router.push('/checkout');
  };

  // Apply coupon
  const applyCoupon = () => {
    if (!couponCode.trim()) {
      alert("Please enter a coupon code");
      return;
    }
    
    // Demo coupon codes
    const validCoupons = ['SAVE10', 'FRESH20', 'WELCOME15'];
    if (validCoupons.includes(couponCode.toUpperCase())) {
      setAppliedCoupon(couponCode.toUpperCase());
      alert(`Coupon "${couponCode}" applied successfully!`);
    } else {
      alert("Invalid coupon code. Try SAVE10, FRESH20, or WELCOME15");
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  // Get popular products for recommendations
  const popularProducts = products
    .filter(p => p.isFeatured)
    .slice(0, 4);

  // Features section
  const features = [
    { icon: Truck, text: "Free Delivery", subtext: "On orders above ₹500" },
    { icon: Shield, text: "Quality Guarantee", subtext: "Freshness assured" },
    { icon: RefreshCw, text: "Easy Returns", subtext: "Within 7 days" },
    { icon: Package, text: "Safe Packaging", subtext: "Hygienic & secure" }
  ];

  // Benefits section for cart
  const cartBenefits = [
    { icon: ShieldCheck, text: "100% Secure Payment", color: "text-green-500" },
    { icon: Award, text: "Quality Assured", color: "text-amber-500" },
    { icon: TrendingDown, text: "Best Price Guarantee", color: "text-red-500" },
    { icon: Zap, text: "Fast Delivery", color: "text-blue-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Hero Section with gradient */}
      <div className="relative bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 text-white py-12 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">Fresh & Organic</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Discover Fresh <br />
                <span className="text-emerald-100">Groceries Delivered</span>
              </h1>
              <p className="text-lg opacity-90 max-w-xl">
                Quality products at unbeatable prices. Free delivery on orders above ₹500
              </p>
            </div>
            <div className="relative">
              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <ShoppingBag className="w-32 h-32 text-white/30" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <feature.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{feature.text}</p>
                  <p className="text-xs text-gray-500">{feature.subtext}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Filters and Search */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Main Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for groceries, fruits, vegetables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-gray-900 placeholder-gray-500 text-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Search
              </button>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Filter className="w-4 h-4 inline mr-2" />
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-gray-900"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-gray-900"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Grid className="w-4 h-4 inline mr-2" />
                  View Options
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`flex-1 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${viewMode === "grid" 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <Grid className="w-5 h-5" />
                    Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`flex-1 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${viewMode === "list" 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <List className="w-5 h-5" />
                    List
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Active Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory("all")} className="ml-1 hover:text-emerald-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Products Section */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-emerald-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
            </div>
            <p className="mt-6 text-gray-600 text-lg">Loading fresh products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <Search className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No products found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
                fetchProducts();
              }}
              className="mt-6 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={() => addToCart(product)}
                formatCurrency={formatCurrency}
                isAdded={addedToCartId === product._id}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <ProductListItem
                key={product._id}
                product={product}
                onAddToCart={() => addToCart(product)}
                formatCurrency={formatCurrency}
                isAdded={addedToCartId === product._id}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-5 py-3 text-black bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${page === i + 1
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Shopping Cart Sidebar - Now with left section */}
     {isCartOpen && (
  <>
    {/* Enhanced Backdrop with blur */}
    <div 
      className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md z-50 animate-fadeIn"
      onClick={() => setIsCartOpen(false)}
    />
    
    {/* Enhanced Cart Container */}
    <div className="fixed right-0 top-0 h-full w-full lg:w-4/5 xl:w-3/4 bg-white shadow-2xl z-50 animate-slideInRight overflow-hidden">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Left Section - Cart Items with enhanced design */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50/30">
          {/* Sticky Header with improved design */}
          <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  {cartItemCount > 0 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg animate-pulse-once">
                      {cartItemCount}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Shopping Cart
                  </h2>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {cartItemCount} items
                    </span>
                    <span className="text-emerald-600 font-medium">• {formatCurrency(cartSubtotal)}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Collapse/Expand Button */}
                <button
                  onClick={() => setIsCartExpanded(!isCartExpanded)}
                  className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-xl transition-all duration-300 border border-gray-300/50 hover:border-emerald-300 group"
                >
                  {isCartExpanded ? (
                    <>
                      <ChevronLeft className="w-4 h-4 text-gray-600 group-hover:text-emerald-600 transition-colors" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700">Collapse</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700">Expand</span>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-600 transition-colors" />
                    </>
                  )}
                </button>
                
                {/* Close Button */}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2.5 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-xl border border-gray-300/50 hover:border-red-300 transition-all duration-300 group"
                >
                  <X className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors" />
                </button>
              </div>
            </div>
            
            {/* Enhanced Progress Bar for Free Shipping */}
            {cartSubtotal < 500 ? (
              <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50/80 to-blue-50/80 rounded-2xl border border-emerald-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white rounded-lg border border-emerald-200">
                      <TruckIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      <span className="text-emerald-600 font-semibold">FREE shipping</span> unlocked at ₹500
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(500 - cartSubtotal)} to go
                  </span>
                </div>
                
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(100, (cartSubtotal / 500) * 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                  </div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-emerald-500 rounded-full shadow-lg"></div>
                </div>
                
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>{formatCurrency(0)}</span>
                  <span>{formatCurrency(500)}</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-800">🎉 Congratulations!</p>
                    <p className="text-sm text-emerald-700">You've unlocked FREE shipping!</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cart Content with enhanced items */}
          <div className="p-6">
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative mx-auto w-32 h-32 mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full"></div>
                  <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-16 h-16 text-gray-300" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                  Your cart feels light
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Add some fresh groceries to get started with your shopping journey
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 font-semibold"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Cart Items Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {cart.map((item, index) => (
                    <div 
                      key={item.productId}
                      className="group relative bg-white rounded-2xl border-2 border-gray-100 hover:border-emerald-200 transition-all duration-300 hover:shadow-xl shadow-lg shadow-gray-200/50 overflow-hidden animate-slideUp"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Remove button with animation */}
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="absolute -top-2 -right-2 p-2.5 bg-gradient-to-r from-white to-gray-50 border border-gray-300 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:border-red-300 z-10"
                      >
                        <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                      </button>

                      <div className="p-5">
                        <div className="flex items-start gap-5">
                          {/* Enhanced Product Image */}
                          <div className="relative flex-shrink-0">
                            <div className="relative w-28 h-28 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-white shadow-inner overflow-hidden group-hover:shadow-lg transition-shadow duration-300">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-10 h-10 text-gray-300" />
                                </div>
                              )}
                              {/* Image Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                            </div>
                            
                            {/* Quantity Badge */}
                            <div className="absolute -top-2 -left-2">
                              <div className="relative">
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                                  {item.quantity}
                                </div>
                                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-30"></div>
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col h-full">
                              <div className="flex-1">
                                {/* Category & Brand Tags */}
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  {item.category && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 text-xs font-medium rounded-full border border-gray-300/50">
                                      <Tag className="w-3 h-3" />
                                      {item.category}
                                    </span>
                                  )}
                                  {item.brand && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-300/50">
                                      <Award className="w-3 h-3" />
                                      {item.brand}
                                    </span>
                                  )}
                                </div>

                                {/* Product Name */}
                                <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                                  {item.name}
                                </h4>
                                
                                {/* Unit & Description */}
                                <div className="flex items-center gap-3 mb-4">
                                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                                    {item.unit}
                                  </span>
                                  <div className="h-4 w-px bg-gray-300"></div>
                                  <span className="text-xs text-gray-500">
                                    {item.maxQuantity} units max
                                  </span>
                                </div>

                                {/* Enhanced Quantity Controls */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl p-1.5 border border-gray-300/50">
                                      <button
                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                        className="w-9 h-9 flex items-center justify-center bg-white hover:bg-gray-200 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                                      >
                                        <Minus className="w-4 h-4 text-gray-700" />
                                      </button>
                                      
                                      <div className="relative">
                                        <div className="w-12 text-center">
                                          <span className="text-lg font-bold text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-300/50 block">
                                            {item.quantity}
                                          </span>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                      </div>
                                      
                                      <button
                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                        disabled={item.quantity >= item.maxQuantity}
                                        className="w-9 h-9 flex items-center justify-center bg-white hover:bg-gray-200 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                                      >
                                        <Plus className="w-4 h-4 text-gray-700" />
                                      </button>
                                    </div>
                                    
                                    {/* Stock Indicator */}
                                    {item.maxQuantity - item.quantity <= 5 && item.quantity < item.maxQuantity && (
                                      <div className="text-xs px-3 py-1.5 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 rounded-lg border border-amber-300/50">
                                        Only {item.maxQuantity - item.quantity} left!
                                      </div>
                                    )}
                                  </div>

                                  {/* Enhanced Price Section */}
                                  <div className="text-right">
                                    <div className="space-y-1">
                                      <p className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                        {formatCurrency(item.finalPrice * item.quantity)}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {formatCurrency(item.finalPrice)} each
                                      </p>
                                      
                                      {/* Savings Display */}
                                      {item.price > item.finalPrice && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-lg border border-emerald-300/50">
                                          <TrendingDown className="w-3 h-3" />
                                          <span className="text-xs font-bold">
                                            Save {formatCurrency((item.price - item.finalPrice) * item.quantity)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom Gradient Border */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Action Buttons */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="flex-1 flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-xl border-2 border-gray-300/50 hover:border-emerald-400 transition-all duration-300 group"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-emerald-600 transition-colors" />
                      <span className="text-lg font-semibold text-gray-700 group-hover:text-emerald-700 transition-colors">
                        Continue Shopping
                      </span>
                    </button>
                    
                    <button
                      onClick={() => {
                        const confirmed = window.confirm("Clear all items from cart?");
                        if (confirmed) setCart([]);
                      }}
                      className="px-6 py-4 bg-gradient-to-r from-red-100 to-red-50 hover:from-red-200 hover:to-red-100 text-red-700 rounded-xl border-2 border-red-300/50 hover:border-red-400 transition-all duration-300 font-semibold"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>

                {/* Enhanced Benefits Section */}
                <div className="bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/80 rounded-2xl border-2 border-emerald-100/50 p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                      <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Shopping Benefits
                      </h4>
                      <p className="text-sm text-gray-600">Exclusive perks for you</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cartBenefits.map((benefit, index) => (
                      <div 
                        key={index}
                        className="group bg-white/80 backdrop-blur-sm rounded-xl border-2 border-gray-200/50 hover:border-emerald-300 p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className={`p-3 rounded-xl bg-gradient-to-br from-white to-gray-50 mb-3 group-hover:scale-110 transition-transform duration-300 ${benefit.color.replace('text-', 'bg-')}/20`}>
                            <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                          </div>
                          <span className="font-semibold text-gray-800">{benefit.text}</span>
                          <div className="mt-2 h-1 w-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Recommendations */}
                {popularProducts.length > 0 && (
                  <div className="rounded-2xl border-2 border-gray-200/50 bg-gradient-to-b from-white to-gray-50/30 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            Recommended for you
                          </h4>
                          <p className="text-sm text-gray-600">Based on your shopping</p>
                        </div>
                      </div>
                      <button className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
                        View all <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {popularProducts.map((product) => (
                        <div 
                          key={product._id}
                          className="group bg-white rounded-xl border-2 border-gray-200/50 hover:border-emerald-300 p-4 transition-all duration-300 hover:shadow-lg overflow-hidden"
                        >
                          <div className="flex flex-col">
                            <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 overflow-hidden">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-12 h-12 text-gray-300" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                            
                            <div className="space-y-3">
                              <h5 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                                {product.name}
                              </h5>
                              
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-lg font-bold text-gray-900">
                                    {formatCurrency(product.finalPrice)}
                                  </p>
                                  {product.mrp && product.mrp > product.finalPrice && (
                                    <p className="text-sm text-gray-500 line-through">
                                      {formatCurrency(product.mrp)}
                                    </p>
                                  )}
                                </div>
                                
                                <button
                                  onClick={() => addToCart(product)}
                                  className="p-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg shadow-emerald-200"
                                >
                                  <Plus className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Enhanced Order Summary */}
        <div className={`lg:w-96 border-l bg-gradient-to-b from-white via-white to-gray-50/30 transition-all duration-500 ${
          isCartExpanded 
            ? 'lg:translate-x-0 lg:opacity-100' 
            : 'lg:translate-x-full lg:opacity-0'
        }`}>
          <div className="sticky top-0 h-full overflow-y-auto">
            <div className="p-6">
              {/* Order Summary Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Order Summary
                  </h3>
                </div>
                <p className="text-gray-600">Review your order details</p>
              </div>

              {/* Price Breakdown Card */}
              <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl border-2 border-gray-200/50 p-5 mb-6 shadow-lg shadow-gray-200/30">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Subtotal</span>
                    <span className="text-lg font-semibold text-gray-900">{formatCurrency(cartSubtotal)}</span>
                  </div>
                  
                  {savings > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-700 font-medium flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" />
                        Product Discounts
                      </span>
                      <span className="text-lg font-bold text-emerald-600">-{formatCurrency(savings)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Tax (18% GST)</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(taxAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium flex items-center gap-2">
                      <TruckIcon className="w-4 h-4" />
                      Delivery
                    </span>
                    <span className={shippingCharge === 0 
                      ? "text-emerald-600 font-bold flex items-center gap-2" 
                      : "text-gray-900 font-medium"
                    }>
                      {shippingCharge === 0 ? (
                        <>
                          <Check className="w-4 h-4" />
                          FREE
                        </>
                      ) : (
                        formatCurrency(shippingCharge)
                      )}
                    </span>
                  </div>
                  
                  {/* Divider */}
                  <div className="border-t border-dashed border-gray-300 pt-4">
                    {/* Coupon Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-700">Apply Coupon</span>
                        {appliedCoupon && (
                          <button
                            onClick={removeCoupon}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Remove
                          </button>
                        )}
                      </div>
                      
                      {appliedCoupon ? (
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                                <Gift className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-bold text-emerald-800">{appliedCoupon}</p>
                                <p className="text-xs text-emerald-600">10% discount applied</p>
                              </div>
                            </div>
                            <span className="text-xl font-bold text-emerald-600">-{formatCurrency(couponDiscount)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="w-full px-4 py-3.5 bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-300/50 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 text-gray-900 placeholder-gray-500"
                          />
                          <button
                            onClick={applyCoupon}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg shadow-amber-200"
                          >
                            Apply
                          </button>
                        </div>
                      )}
                      
                      {/* Available Coupons */}
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">Try these coupons:</p>
                        <div className="flex flex-wrap gap-2">
                          {['SAVE10', 'FRESH20', 'WELCOME15'].map((code) => (
                            <button
                              key={code}
                              onClick={() => {
                                setCouponCode(code);
                                if (!appliedCoupon) applyCoupon();
                              }}
                              className="text-xs px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-lg border border-emerald-300 hover:border-emerald-400 hover:from-emerald-200 hover:to-teal-200 transition-all duration-200"
                            >
                              {code}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Total Amount */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="text-lg font-bold text-gray-900">Total Amount</p>
                        <p className="text-sm text-gray-600">Inclusive of all taxes</p>
                      </div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {formatCurrency(cartTotal)}
                      </p>
                    </div>
                    
                    {/* Savings Summary */}
                    {(savings > 0 || couponDiscount > 0) && (
                      <div className="mt-3 pt-3 border-t border-dashed border-emerald-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total savings</span>
                          <span className="text-lg font-bold text-emerald-600">
                            {formatCurrency(savings + couponDiscount)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Info Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-2xl border-2 border-blue-200/50 p-5 mb-6">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 mb-1">Fast Delivery</h4>
                    <p className="text-sm text-blue-700 mb-2">Estimated delivery in 30-45 minutes</p>
                    <div className="text-xs text-blue-600 bg-blue-100/50 px-3 py-1.5 rounded-lg inline-block">
                      🚀 Order within 15 mins for same-day delivery
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={proceedToCheckout}
                  disabled={cart.length === 0}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-600 transition-all duration-300 shadow-2xl shadow-emerald-300/50 hover:shadow-3xl hover:shadow-emerald-400/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                >
                  <CreditCard className="w-5 h-5" />
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                {/* Extra Options */}
                <div className="grid grid-cols-3 gap-3">
                  <button className="p-3 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-xl border-2 border-gray-300/50 hover:border-purple-300 transition-all duration-300 group">
                    <Gift className="w-5 h-5 text-gray-600 group-hover:text-purple-600 mx-auto mb-1" />
                    <span className="text-xs font-medium text-gray-700 group-hover:text-purple-700">Gift</span>
                  </button>
                  <button className="p-3 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-xl border-2 border-gray-300/50 hover:border-blue-300 transition-all duration-300 group">
                    <Wallet className="w-5 h-5 text-gray-600 group-hover:text-blue-600 mx-auto mb-1" />
                    <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">Wallet</span>
                  </button>
                  <button className="p-3 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-xl border-2 border-gray-300/50 hover:border-amber-300 transition-all duration-300 group">
                    <Calendar className="w-5 h-5 text-gray-600 group-hover:text-amber-600 mx-auto mb-1" />
                    <span className="text-xs font-medium text-gray-700 group-hover:text-amber-700">Schedule</span>
                  </button>
                </div>
              </div>

              {/* Security Badges */}
              <div className="mt-8 pt-6 border-t border-gray-300/50">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Lock className="w-4 h-4" />
                    <span>SSL Secure</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ShieldIcon className="w-4 h-4" />
                    <span>100% Safe</span>
                  </div>
                </div>
                
                {/* Trust Badges Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-emerald-50 to-emerald-100/30 rounded-lg">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-emerald-700">Fresh Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-blue-50 to-blue-100/30 rounded-lg">
                    <PackageIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-blue-700">Contactless</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-amber-50 to-amber-100/30 rounded-lg">
                    <TruckIcon className="w-4 h-4 text-amber-600" />
                    <span className="text-xs text-amber-700">Live Tracking</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-purple-50 to-purple-100/30 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-purple-700">Quality Checked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
)}

      {/* Enhanced Floating Cart Button */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-8 right-8 z-40 animate-bounce-once">
          <button
            onClick={() => setIsCartOpen(true)}
            className="group relative"
          >
            {/* Notification badge */}
            <div className="absolute -top-2 -right-2">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                <div className="relative w-7 h-7 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                  {cartItemCount}
                </div>
              </div>
            </div>

            {/* Cart button */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-5 rounded-2xl shadow-2xl shadow-emerald-300 hover:shadow-3xl hover:shadow-emerald-400 transition-all duration-300 group-hover:scale-105 flex items-center gap-3">
              <ShoppingCart className="w-7 h-7" />
              <div className="text-left">
                <div className="font-bold text-lg">{formatCurrency(cartTotal)}</div>
                <div className="text-xs opacity-90">View Cart</div>
              </div>
            </div>

            {/* Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Click to view cart
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-l-gray-900"></div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

// Enhanced Product Card Component (Same as before)
function ProductCard({
  product,
  onAddToCart,
  formatCurrency,
  isAdded
}: {
  product: Product;
  onAddToCart: () => void;
  formatCurrency: (amount: number) => string;
  isAdded: boolean;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Added to cart animation */}
      {isAdded && (
        <div className="absolute inset-0 bg-emerald-500/10 z-20 flex items-center justify-center animate-pulse">
          <div className="bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Added to Cart!</span>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`p-2 rounded-full backdrop-blur-sm ${isLiked 
            ? 'bg-red-500/20 text-red-500' 
            : 'bg-white/80 text-gray-600 hover:text-red-500'}`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        </button>
        <button className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:text-blue-500">
          <Share2 className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:text-emerald-500">
          <Eye className="w-5 h-5" />
        </button>
      </div>

      {/* Product Image */}
      <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-300" />
          </div>
        )}

        {/* Discount Badge */}
        {product.discount && product.discount > 0 && (
          <div className="absolute top-3 left-3">
            <div className="relative">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-lg font-bold shadow-lg">
                {product.discount}% OFF
              </div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-red-500"></div>
            </div>
          </div>
        )}

        {/* Stock Status */}
        <div className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
          product.inStock 
            ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30' 
            : 'bg-red-500/20 text-red-700 border border-red-500/30'
        }`}>
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <StarIcon className="w-3 h-3 text-yellow-500 fill-current" />
            <span className="text-xs font-bold">{product.rating}</span>
            <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5">
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            {product.category}
          </span>
          {product.isFeatured && (
            <span className="ml-2 inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              Featured
            </span>
          )}
        </div>

        <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description || `${product.brand || ''} ${product.unit}`}
        </p>

        {/* Price Section */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(product.finalPrice)}
            </span>
            {(product.mrp || product.price) > product.finalPrice && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(product.mrp || product.price)}
                </span>
                {product.discount && product.discount > 0 && (
                  <span className="text-xs font-bold text-emerald-600">
                    Save {formatCurrency((product.mrp || product.price) - product.finalPrice)}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500 block">per</span>
            <span className="text-sm font-medium text-gray-700">{product.unit}</span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={onAddToCart}
          disabled={!product.inStock}
          className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            product.inStock
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {product.inStock ? (
            <>
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </>
          ) : (
            'Out of Stock'
          )}
        </button>

        {/* Quick view on hover */}
        {isHovered && (
          <div className="absolute inset-x-0 bottom-full mb-2 bg-white rounded-lg shadow-lg p-4 border opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                <span>Fresh quality guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-blue-500" />
                <span>Same day delivery available</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-amber-500" />
                <span>Easy returns within 7 days</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Product List Item Component (Same as before)
function ProductListItem({
  product,
  onAddToCart,
  formatCurrency,
  isAdded
}: {
  product: Product;
  onAddToCart: () => void;
  formatCurrency: (amount: number) => string;
  isAdded: boolean;
}) {
  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex gap-6 hover:shadow-lg transition-all group">
      {isAdded && (
        <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl border-2 border-emerald-500/30 animate-pulse"></div>
      )}

      {/* Image */}
      <div className="relative w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border overflow-hidden flex-shrink-0">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
        )}
        
        {product.discount && product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold">
            -{product.discount}%
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    {product.category}
                  </span>
                  {!product.inStock && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                  {product.name}
                </h3>
                
                {product.brand && (
                  <p className="text-sm text-gray-600 mb-3">Brand: {product.brand}</p>
                )}
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {product.description}
                </p>
              </div>
              
              <div className="text-right flex-shrink-0">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(product.finalPrice)}
                  </p>
                  {(product.mrp || product.price) > product.finalPrice && (
                    <p className="text-sm text-gray-500 line-through">
                      {formatCurrency(product.mrp || product.price)}
                    </p>
                  )}
                  <p className="text-xs text-gray-600">{product.unit}</p>
                </div>
                
                {product.rating && (
                  <div className="flex items-center gap-1 justify-end mt-2">
                    <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-bold">{product.rating}</span>
                    <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              {product.inStock ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                  In Stock ({product.stock} units)
                </span>
              ) : (
                <span className="text-red-600">Out of Stock</span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              
              <button
                onClick={onAddToCart}
                disabled={!product.inStock}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  product.inStock
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-200'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}