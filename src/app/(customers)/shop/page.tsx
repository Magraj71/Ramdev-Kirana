// src/app/shop/page.tsx (Fully responsive redesign)
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
  Lock,
  Menu,
  Smartphone,
  Tablet,
  Monitor
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Detect device type
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDeviceType('mobile');
        setViewMode('grid'); // Default to grid on mobile
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

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

  // Features section - responsive grid
  const features = [
    { icon: Truck, text: "Free Delivery", subtext: "Above ₹500" },
    { icon: Shield, text: "Quality", subtext: "Freshness assured" },
    { icon: RefreshCw, text: "Easy Returns", subtext: "Within 7 days" },
    { icon: Package, text: "Safe Packing", subtext: "Hygienic & secure" }
  ];

  // Benefits section for cart
  const cartBenefits = [
    { icon: ShieldCheck, text: "Secure Payment", color: "text-green-500" },
    { icon: Award, text: "Quality Assured", color: "text-amber-500" },
    { icon: TrendingDown, text: "Best Price", color: "text-red-500" },
    { icon: Zap, text: "Fast Delivery", color: "text-blue-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Mobile Filter Button */}
      {deviceType === 'mobile' && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Hero Section - Responsive */}
      <div className="relative bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 text-white py-8 md:py-12 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-3 md:mb-4">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm">Fresh & Organic</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 leading-tight">
                Discover Fresh <br className="hidden sm:block" />
                <span className="text-emerald-100">Groceries Delivered</span>
              </h1>
              <p className="text-sm md:text-lg opacity-90 max-w-xl">
                Quality products at unbeatable prices. Free delivery on orders above ₹500
              </p>
            </div>
            <div className="hidden md:block relative">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <ShoppingBag className="w-24 h-24 md:w-32 md:h-32 text-white/30" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Bar - Responsive */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 md:py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="p-1.5 md:p-2 bg-emerald-50 rounded-lg flex-shrink-0">
                  <feature.icon className="w-3 h-3 md:w-4 md:h-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{feature.text}</p>
                  <p className="text-xs text-gray-500 truncate">{feature.subtext}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 md:py-8">
        {/* Mobile Filter Menu */}
        {isMobileMenuOpen && deviceType === 'mobile' && (
          <div className="fixed inset-0 z-50 bg-white">
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Filters</h2>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 bg-gray-50 border rounded-lg"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 bg-gray-50 border rounded-lg"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">View Mode</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`flex-1 p-3 rounded-lg ${viewMode === "grid" ? 'bg-emerald-500 text-white' : 'bg-gray-100'}`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`flex-1 p-3 rounded-lg ${viewMode === "list" ? 'bg-emerald-500 text-white' : 'bg-gray-100'}`}
                    >
                      List
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    fetchProducts();
                  }}
                  className="w-full py-3 bg-emerald-500 text-white rounded-lg font-semibold"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Filters and Search - Responsive */}
        <div className="mb-6 md:mb-8 bg-white rounded-xl md:rounded-2xl shadow-sm md:shadow-lg p-4 md:p-6 border border-gray-100">
          {/* Main Search Bar - Responsive */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for groceries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-20 md:pl-12 md:pr-24 py-3 md:py-4 bg-gray-50 border border-gray-200 md:border-2 rounded-lg md:rounded-xl focus:outline-none focus:border-emerald-500 text-sm md:text-base text-gray-900 placeholder-gray-500"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-emerald-500 text-white px-3 py-1.5 md:px-6 md:py-2 rounded-lg hover:bg-emerald-600 transition-colors text-sm md:text-base"
              >
                Search
              </button>
            </div>

            {/* Filters Row - Hidden on mobile, shown on tablet/desktop */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  <Filter className="w-3 h-3 md:w-4 md:h-4 inline mr-1 md:mr-2" />
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 md:border-2 rounded-lg md:rounded-xl focus:outline-none focus:border-emerald-500 text-sm md:text-base text-gray-900"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  <TrendingUp className="w-3 h-3 md:w-4 md:h-4 inline mr-1 md:mr-2" />
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-gray-50 border border-gray-200 md:border-2 rounded-lg md:rounded-xl focus:outline-none focus:border-emerald-500 text-sm md:text-base text-gray-900"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  <Grid className="w-3 h-3 md:w-4 md:h-4 inline mr-1 md:mr-2" />
                  View Options
                </label>
                <div className="flex gap-1 md:gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`flex-1 px-2 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl flex items-center justify-center gap-1 md:gap-2 transition-all ${viewMode === "grid" 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <Grid className="w-3 h-3 md:w-4 md:h-5" />
                    <span className="text-xs md:text-sm">Grid</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`flex-1 px-2 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl flex items-center justify-center gap-1 md:gap-2 transition-all ${viewMode === "list" 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <List className="w-3 h-3 md:w-4 md:h-5" />
                    <span className="text-xs md:text-sm">List</span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Active Filters - Responsive */}
          <div className="mt-3 md:mt-4 flex flex-wrap gap-1 md:gap-2">
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs md:text-sm">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory("all")} className="ml-1 hover:text-emerald-900">
                  <X className="w-2 h-2 md:w-3 md:h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-blue-900">
                  <X className="w-2 h-2 md:w-3 md:h-3" />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Products Section - Responsive */}
        {loading ? (
          <div className="text-center py-12 md:py-20">
            <div className="inline-flex items-center justify-center">
              <div className="relative">
                <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-emerald-200 rounded-full"></div>
                <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
            </div>
            <p className="mt-4 md:mt-6 text-gray-600 text-sm md:text-lg">Loading fresh products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <div className="w-20 h-20 md:w-32 md:h-32 mx-auto mb-4 md:mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 md:w-16 md:h-16 text-gray-400" />
            </div>
            <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 md:mb-3">No products found</h3>
            <p className="text-gray-600 max-w-md mx-auto text-sm md:text-base px-4">
              Try adjusting your search or filter criteria.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
                fetchProducts();
              }}
              className="mt-4 md:mt-6 px-4 md:px-6 py-2 md:py-3 bg-emerald-500 text-white rounded-lg md:rounded-xl hover:bg-emerald-600 transition-colors text-sm md:text-base"
            >
              Clear Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={() => addToCart(product)}
                formatCurrency={formatCurrency}
                isAdded={addedToCartId === product._id}
                deviceType={deviceType}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {products.map((product) => (
              <ProductListItem
                key={product._id}
                product={product}
                onAddToCart={() => addToCart(product)}
                formatCurrency={formatCurrency}
                isAdded={addedToCartId === product._id}
                deviceType={deviceType}
              />
            ))}
          </div>
        )}

        {/* Pagination - Responsive */}
        {totalPages > 1 && (
          <div className="mt-8 md:mt-12">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2 md:py-3 text-black bg-white border border-gray-200 md:border-2 rounded-lg md:rounded-xl hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-1 md:gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg transition-all text-sm md:text-base ${page === i + 1
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
                className="flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2 md:py-3 bg-white border border-gray-200 md:border-2 rounded-lg md:rounded-xl hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Shopping Cart Sidebar - Fully Responsive */}
      {isCartOpen && (
        <>
          {/* Enhanced Backdrop */}
          <div 
            className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md z-50 animate-fadeIn"
            onClick={() => setIsCartOpen(false)}
          />
          
          {/* Cart Container - Responsive */}
          <div className={`fixed top-0 h-full w-full lg:w-4/5 xl:w-3/4 bg-white shadow-2xl z-50 animate-slideInRight overflow-hidden ${
            deviceType === 'mobile' ? 'right-0' : 'right-0'
          }`}>
            <div className="flex flex-col lg:flex-row h-full">
              {/* Left Section - Cart Items */}
              <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50/30">
                {/* Sticky Header */}
                <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="relative">
                        <div className="p-1.5 md:p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg md:rounded-xl">
                          <ShoppingCart className="w-4 h-4 md:w-6 md:h-6 text-white" />
                        </div>
                        {cartItemCount > 0 && (
                          <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-6 md:h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg animate-pulse-once">
                            {cartItemCount}
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                          Shopping Cart
                        </h2>
                        <p className="text-xs md:text-sm text-gray-600 flex items-center gap-1 md:gap-2">
                          <span className="inline-flex items-center gap-1">
                            <Package className="w-2 h-2 md:w-3 md:h-3" />
                            {cartItemCount} items
                          </span>
                          <span className="text-emerald-600 font-medium">• {formatCurrency(cartSubtotal)}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 md:gap-3">
                      {/* Collapse/Expand Button - Desktop Only */}
                      <button
                        onClick={() => setIsCartExpanded(!isCartExpanded)}
                        className="hidden lg:flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-lg md:rounded-xl transition-all duration-300 border border-gray-300/50 hover:border-emerald-300 group text-xs md:text-sm"
                      >
                        {isCartExpanded ? (
                          <>
                            <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 text-gray-600 group-hover:text-emerald-600 transition-colors" />
                            <span className="hidden md:inline">Collapse</span>
                          </>
                        ) : (
                          <>
                            <span className="hidden md:inline">Expand</span>
                            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-600 group-hover:text-emerald-600 transition-colors" />
                          </>
                        )}
                      </button>
                      
                      {/* Close Button */}
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-1.5 md:p-2.5 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-lg md:rounded-xl border border-gray-300/50 hover:border-red-300 transition-all duration-300 group"
                      >
                        <X className="w-4 h-4 md:w-5 md:h-5 text-gray-500 group-hover:text-red-500 transition-colors" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Enhanced Progress Bar */}
                  {cartSubtotal < 500 ? (
                    <div className="mt-3 md:mt-4 p-3 md:p-4 bg-gradient-to-r from-emerald-50/80 to-blue-50/80 rounded-xl md:rounded-2xl border border-emerald-100">
                      <div className="flex items-center justify-between mb-1 md:mb-2">
                        <div className="flex items-center gap-1 md:gap-2">
                          <div className="p-1 md:p-1.5 bg-white rounded-lg border border-emerald-200">
                            <TruckIcon className="w-3 h-3 md:w-4 md:h-4 text-emerald-600" />
                          </div>
                          <span className="text-xs md:text-sm font-medium text-gray-800">
                            <span className="text-emerald-600 font-semibold">FREE shipping</span> at ₹500
                          </span>
                        </div>
                        <span className="text-xs md:text-sm font-bold text-gray-900">
                          {formatCurrency(500 - cartSubtotal)} to go
                        </span>
                      </div>
                      
                      <div className="relative h-2 md:h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${Math.min(100, (cartSubtotal / 500) * 100)}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between mt-1 md:mt-2 text-xs text-gray-600">
                        <span>{formatCurrency(0)}</span>
                        <span>{formatCurrency(500)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 md:mt-4 p-3 md:p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl md:rounded-2xl border border-emerald-200">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                          <Check className="w-3 h-3 md:w-5 md:h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-800 text-sm md:text-base">🎉 Congratulations!</p>
                          <p className="text-xs md:text-sm text-emerald-700">You've unlocked FREE shipping!</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cart Content */}
                <div className="p-4 md:p-6">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 md:py-16">
                      <div className="relative mx-auto w-20 h-20 md:w-32 md:h-32 mb-4 md:mb-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full"></div>
                        <div className="absolute inset-3 md:inset-4 bg-white rounded-full flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 md:w-16 md:h-16 text-gray-300" />
                        </div>
                      </div>
                      <h3 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2 md:mb-3">
                        Your cart feels light
                      </h3>
                      <p className="text-gray-600 mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base">
                        Add some fresh groceries to get started
                      </p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="px-6 md:px-8 py-2.5 md:py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg md:rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 font-semibold text-sm md:text-base"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 md:space-y-8">
                      {/* Cart Items Grid */}
                      <div className="grid grid-cols-1 gap-3 md:gap-4">
                        {cart.map((item, index) => (
                          <div 
                            key={item.productId}
                            className="group relative bg-white rounded-xl md:rounded-2xl border border-gray-100 hover:border-emerald-200 transition-all duration-300 overflow-hidden animate-slideUp"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="p-3 md:p-5">
                              <div className="flex items-start gap-3 md:gap-5">
                                {/* Product Image */}
                                <div className="relative flex-shrink-0">
                                  <div className="relative w-16 h-16 md:w-28 md:h-28 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg md:rounded-2xl border border-white overflow-hidden">
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-6 h-6 md:w-10 md:h-10 text-gray-300" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Quantity Badge */}
                                  <div className="absolute -top-1 -left-1 md:-top-2 md:-left-2">
                                    <div className="relative">
                                      <div className="w-5 h-5 md:w-8 md:h-8 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                                        {item.quantity}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col h-full">
                                    <div className="flex-1">
                                      {/* Remove button for mobile */}
                                      <button
                                        onClick={() => removeFromCart(item.productId)}
                                        className="absolute top-2 right-2 p-1 bg-white border border-gray-300 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-50 z-10"
                                      >
                                        <Trash2 className="w-3 h-3 text-gray-500 hover:text-red-500 transition-colors" />
                                      </button>

                                      {/* Category & Brand Tags */}
                                      <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-2 md:mb-3">
                                        {item.category && (
                                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-300/50">
                                            <Tag className="w-2 h-2 md:w-3 md:h-3" />
                                            {item.category}
                                          </span>
                                        )}
                                      </div>

                                      {/* Product Name */}
                                      <h4 className="font-bold text-gray-900 mb-1 md:mb-2 line-clamp-1 text-sm md:text-lg">
                                        {item.name}
                                      </h4>
                                      
                                      {/* Unit & Max */}
                                      <div className="flex items-center gap-2 mb-2 md:mb-4">
                                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                          {item.unit}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {item.maxQuantity} max
                                        </span>
                                      </div>

                                      {/* Enhanced Quantity Controls */}
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 md:p-1.5">
                                            <button
                                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                              className="w-6 h-6 md:w-9 md:h-9 flex items-center justify-center bg-white hover:bg-gray-200 rounded transition-all duration-200"
                                            >
                                              <Minus className="w-2 h-2 md:w-4 md:h-4 text-gray-700" />
                                            </button>
                                            
                                            <div className="w-8 md:w-12 text-center">
                                              <span className="text-sm md:text-lg font-bold text-gray-900 bg-white px-1 md:px-3 py-0.5 md:py-1.5 rounded border border-gray-300/50 block">
                                                {item.quantity}
                                              </span>
                                            </div>
                                            
                                            <button
                                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                              disabled={item.quantity >= item.maxQuantity}
                                              className="w-6 h-6 md:w-9 md:h-9 flex items-center justify-center bg-white hover:bg-gray-200 rounded transition-all duration-200 disabled:opacity-50"
                                            >
                                              <Plus className="w-2 h-2 md:w-4 md:h-4 text-gray-700" />
                                            </button>
                                          </div>
                                          
                                          {/* Stock Indicator */}
                                          {item.maxQuantity - item.quantity <= 5 && item.quantity < item.maxQuantity && (
                                            <div className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded border border-amber-300/50">
                                              Only {item.maxQuantity - item.quantity} left!
                                            </div>
                                          )}
                                        </div>

                                        {/* Price Section */}
                                        <div className="text-right">
                                          <p className="text-lg md:text-2xl font-bold text-gray-900">
                                            {formatCurrency(item.finalPrice * item.quantity)}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {formatCurrency(item.finalPrice)} each
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                          <button
                            onClick={() => setIsCartOpen(false)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 md:py-4 bg-gray-100 hover:bg-gray-200 rounded-lg md:rounded-xl border border-gray-300/50 transition-all duration-300 group text-sm md:text-base"
                          >
                            <ArrowLeft className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold text-gray-700">
                              Continue Shopping
                            </span>
                          </button>
                          
                          <button
                            onClick={() => {
                              const confirmed = window.confirm("Clear all items from cart?");
                              if (confirmed) setCart([]);
                            }}
                            className="px-4 py-2.5 md:px-6 md:py-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg md:rounded-xl border border-red-300/50 transition-all duration-300 font-semibold text-sm md:text-base"
                          >
                            Clear Cart
                          </button>
                        </div>
                      </div>

                      {/* Recommendations - Tablet and Desktop Only */}
                      {deviceType !== 'mobile' && popularProducts.length > 0 && (
                        <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/30 p-4 md:p-6">
                          <div className="flex items-center justify-between mb-4 md:mb-6">
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className="p-1.5 md:p-2.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg md:rounded-xl">
                                <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="text-base md:text-xl font-bold text-gray-900">
                                  Recommended for you
                                </h4>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                            {popularProducts.slice(0, 2).map((product) => (
                              <div 
                                key={product._id}
                                className="group bg-white rounded-lg md:rounded-xl border border-gray-200 hover:border-emerald-300 p-2 md:p-4 transition-all duration-300 overflow-hidden"
                              >
                                <div className="flex flex-col">
                                  <div className="relative h-20 md:h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-2 md:mb-4 overflow-hidden">
                                    {product.image ? (
                                      <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-6 h-6 md:w-12 md:h-12 text-gray-300" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-1 md:space-y-3">
                                    <h5 className="font-semibold text-gray-900 line-clamp-1 text-xs md:text-sm">
                                      {product.name}
                                    </h5>
                                    
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm md:text-lg font-bold text-gray-900">
                                          {formatCurrency(product.finalPrice)}
                                        </p>
                                      </div>
                                      
                                      <button
                                        onClick={() => addToCart(product)}
                                        className="p-1 md:p-2.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-all duration-300"
                                      >
                                        <Plus className="w-3 h-3 md:w-5 md:h-5" />
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

              {/* Right Section - Order Summary - Desktop Only */}
              {deviceType !== 'mobile' && (
                <div className={`lg:w-96 border-l bg-gradient-to-b from-white via-white to-gray-50/30 transition-all duration-500 ${
                  isCartExpanded 
                    ? 'lg:translate-x-0 lg:opacity-100' 
                    : 'lg:translate-x-full lg:opacity-0'
                }`}>
                  <div className="sticky top-0 h-full overflow-y-auto">
                    <div className="p-4 md:p-6">
                      {/* Order Summary Header */}
                      <div className="mb-6 md:mb-8">
                        <div className="flex items-center gap-2 md:gap-3 mb-2">
                          <div className="p-1.5 md:p-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg md:rounded-xl">
                            <CreditCard className="w-4 h-4 md:w-6 md:h-6 text-white" />
                          </div>
                          <h3 className="text-lg md:text-2xl font-bold text-gray-900">
                            Order Summary
                          </h3>
                        </div>
                      </div>

                      {/* Price Breakdown Card */}
                      <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-xl md:rounded-2xl border border-gray-200/50 p-3 md:p-5 mb-4 md:mb-6">
                        <div className="space-y-3 md:space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium text-sm md:text-base">Subtotal</span>
                            <span className="font-semibold text-gray-900 text-sm md:text-lg">{formatCurrency(cartSubtotal)}</span>
                          </div>
                          
                          {savings > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-emerald-700 font-medium text-sm md:text-base">
                                Product Discounts
                              </span>
                              <span className="font-bold text-emerald-600 text-sm md:text-lg">-{formatCurrency(savings)}</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium text-sm md:text-base">Delivery</span>
                            <span className={shippingCharge === 0 
                              ? "text-emerald-600 font-bold text-sm md:text-base" 
                              : "text-gray-900 font-medium"
                            }>
                              {shippingCharge === 0 ? 'FREE' : formatCurrency(shippingCharge)}
                            </span>
                          </div>
                          
                          {/* Coupon Section */}
                          <div className="border-t border-dashed border-gray-300 pt-3 md:pt-4">
                            <div className="mb-3 md:mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-700 text-sm md:text-base">Apply Coupon</span>
                                {appliedCoupon && (
                                  <button
                                    onClick={removeCoupon}
                                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                                  >
                                    <X className="w-2 h-2 md:w-3 md:h-3" />
                                    Remove
                                  </button>
                                )}
                              </div>
                              
                              {appliedCoupon ? (
                                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg md:rounded-xl border border-emerald-200 p-2 md:p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="p-1 md:p-2 bg-emerald-500 rounded">
                                        <Gift className="w-3 h-3 md:w-5 md:h-5 text-white" />
                                      </div>
                                      <div>
                                        <p className="font-bold text-emerald-800 text-xs md:text-sm">{appliedCoupon}</p>
                                        <p className="text-xs text-emerald-600">10% discount</p>
                                      </div>
                                    </div>
                                    <span className="font-bold text-emerald-600 text-sm md:text-xl">-{formatCurrency(couponDiscount)}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Enter coupon code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    className="w-full px-3 md:px-4 py-2 md:py-3.5 bg-gray-100 border border-gray-300/50 rounded-lg md:rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900 placeholder-gray-500 text-sm md:text-base"
                                  />
                                  <button
                                    onClick={applyCoupon}
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 px-2 md:px-4 py-1 md:py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-all duration-300 text-xs md:text-sm"
                                  >
                                    Apply
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Total Amount */}
                          <div className="bg-gray-50 rounded-lg md:rounded-xl p-3 md:p-4">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <p className="font-bold text-gray-900 text-sm md:text-lg">Total Amount</p>
                                <p className="text-gray-600 text-xs md:text-sm">Inclusive of all taxes</p>
                              </div>
                              <p className="text-xl md:text-3xl font-bold text-emerald-600">
                                {formatCurrency(cartTotal)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Action Button */}
                      <div className="space-y-3 md:space-y-4">
                        <button
                          onClick={proceedToCheckout}
                          disabled={cart.length === 0}
                          className="w-full py-3 md:py-4 bg-emerald-500 text-white rounded-lg md:rounded-xl font-bold hover:bg-emerald-600 transition-all duration-300 shadow-lg shadow-emerald-200/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base"
                        >
                          <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
                          Proceed to Checkout
                          <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Mobile Checkout Bar */}
      {deviceType === 'mobile' && cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total ({cartItemCount} items)</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(cartTotal)}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium"
              >
                View Cart
              </button>
              <button
                onClick={proceedToCheckout}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Floating Cart Button - Desktop Only */}
      {deviceType !== 'mobile' && cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="group relative"
          >
            <div className="absolute -top-2 -right-2">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                <div className="relative w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                  {cartItemCount}
                </div>
              </div>
            </div>

            <div className="bg-emerald-500 text-white p-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <div className="text-left">
                <div className="font-bold">{formatCurrency(cartTotal)}</div>
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

// Responsive Product Card Component
function ProductCard({
  product,
  onAddToCart,
  formatCurrency,
  isAdded,
  deviceType
}: {
  product: Product;
  onAddToCart: () => void;
  formatCurrency: (amount: number) => string;
  isAdded: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}) {
  const [isLiked, setIsLiked] = useState(false);
  const isMobile = deviceType === 'mobile';

  return (
    <div className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden">
      {/* Added to cart animation */}
      {isAdded && (
        <div className="absolute inset-0 bg-emerald-500/10 z-20 flex items-center justify-center animate-pulse">
          <div className="bg-emerald-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 text-xs">
            <CheckCircle className="w-3 h-3" />
            <span>Added!</span>
          </div>
        </div>
      )}

      {/* Product Image */}
      <div className="relative h-32 sm:h-36 md:h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 md:w-12 md:h-12 text-gray-300" />
          </div>
        )}

        {/* Discount Badge */}
        {product.discount && product.discount > 0 && (
          <div className="absolute top-2 left-2">
            <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              {product.discount}% OFF
            </div>
          </div>
        )}

        {/* Quick actions - Desktop only */}
        {!isMobile && (
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={`p-1.5 rounded-full backdrop-blur-sm ${isLiked 
                ? 'bg-red-500/20 text-red-500' 
                : 'bg-white/80 text-gray-600 hover:text-red-500'}`}
            >
              <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
        )}

        {/* Stock Status */}
        <div className={`absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
          product.inStock 
            ? 'bg-emerald-500/20 text-emerald-700' 
            : 'bg-red-500/20 text-red-700'
        }`}>
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3">
        <div className="mb-2">
          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full truncate max-w-full">
            {product.category}
          </span>
        </div>

        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 text-sm md:text-base">
          {product.name}
        </h3>

        <p className="text-xs text-gray-600 mb-2 line-clamp-2 hidden sm:block">
          {product.description || `${product.brand || ''} ${product.unit}`}
        </p>

        {/* Price Section */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-base md:text-lg font-bold text-gray-900">
              {formatCurrency(product.finalPrice)}
            </span>
            {(product.mrp || product.price) > product.finalPrice && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 line-through">
                  {formatCurrency(product.mrp || product.price)}
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500">{product.unit}</span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={onAddToCart}
          disabled={!product.inStock}
          className={`w-full py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-1 text-xs md:text-sm ${
            product.inStock
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}

// Responsive Product List Item Component
function ProductListItem({
  product,
  onAddToCart,
  formatCurrency,
  isAdded,
  deviceType
}: {
  product: Product;
  onAddToCart: () => void;
  formatCurrency: (amount: number) => string;
  isAdded: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}) {
  const isMobile = deviceType === 'mobile';

  return (
    <div className="relative bg-white rounded-lg border border-gray-100 p-3 md:p-6 flex gap-3 md:gap-6 hover:shadow-sm transition-all">
      {/* Image */}
      <div className="relative w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border overflow-hidden flex-shrink-0">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-6 h-6 md:w-12 md:h-12 text-gray-300" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 md:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {product.category}
                  </span>
                  {!product.inStock && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>
                
                <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1 md:mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                {!isMobile && product.description && (
                  <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>
              
              <div className="text-right flex-shrink-0">
                <div className="space-y-0.5 md:space-y-1">
                  <p className="text-base md:text-xl font-bold text-gray-900">
                    {formatCurrency(product.finalPrice)}
                  </p>
                  {(product.mrp || product.price) > product.finalPrice && (
                    <p className="text-xs text-gray-500 line-through">
                      {formatCurrency(product.mrp || product.price)}
                    </p>
                  )}
                  <p className="text-xs text-gray-600">{product.unit}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 md:pt-4 border-t">
            <div className="text-xs text-gray-600">
              {product.inStock ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle className="w-3 h-3" />
                  In Stock
                </span>
              ) : (
                <span className="text-red-600">Out of Stock</span>
              )}
            </div>
            
            <button
              onClick={onAddToCart}
              disabled={!product.inStock}
              className={`px-3 md:px-6 py-1.5 md:py-2 rounded-lg font-medium transition-all text-xs md:text-sm ${
                product.inStock
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}