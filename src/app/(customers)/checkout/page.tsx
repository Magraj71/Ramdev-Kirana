// app/checkout/page.tsx (Fully Responsive)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { 
  ArrowLeft, 
  CheckCircle, 
  CreditCard, 
  Truck,
  Shield,
  Lock,
  ShoppingCart,
  MapPin,
  User,
  Mail,
  Phone,
  Home,
  Building,
  Map,
  Navigation,
  Clock,
  Package,
  Check,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  X,
  Plus,
  Minus,
  Sparkles,
  Gift
} from "lucide-react";

interface CartItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  finalPrice: number;
  discount: number;
  unit: string;
  image: string;
  stock: number;
  maxQuantity: number;
  brand?: string;
  category?: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [savingAmount, setSavingAmount] = useState(0);
  const [deliverySlot, setDeliverySlot] = useState("30-45 mins");
  const [orderNotes, setOrderNotes] = useState("");
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      landmark: ""
    }
  });
  
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isMobile, setIsMobile] = useState(false);
  
  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Load cart from localStorage
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const cartData = JSON.parse(savedCart);
          setCart(cartData);
          
          // Calculate savings
          const savings = cartData.reduce((total: number, item: any) => {
            const itemPrice = item.price || 0;
            const itemFinalPrice = item.finalPrice || itemPrice;
            const itemQuantity = item.quantity || 1;
            const itemSavings = (itemPrice - itemFinalPrice) * itemQuantity;
            return total + Math.max(0, itemSavings);
          }, 0);
          setSavingAmount(savings);
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCart();
  }, []);
  
  // Calculate totals
  const subtotal = cart.reduce((sum, item) => {
    const price = item.finalPrice || item.unitPrice || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);
  
  const tax = 0;
  const shipping = subtotal > 500 ? 0 : 0;
  const total = subtotal;
  
  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setCustomer(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CustomerInfo] as any),
          [child]: value
        }
      }));
    } else {
      setCustomer(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors: string[] = [];
    
    if (!customer.name.trim()) errors.push("Name is required");
    if (!customer.email.trim()) errors.push("Email is required");
    if (!customer.phone.trim() || customer.phone.length < 10) errors.push("Valid phone number is required");
    if (!customer.address.street.trim()) errors.push("Street address is required");
    if (!customer.address.city.trim()) errors.push("City is required");
    if (!customer.address.state.trim()) errors.push("State is required");
    if (!customer.address.pincode.trim() || customer.address.pincode.length < 6) errors.push("Valid pincode is required");
    
    return errors;
  };
  
  const placeOrder = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }
    
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }
    
    try {
      setPlacingOrder(true);
      
      const orderData = {
        storeId: "6953d5b93bf16cfe78d9a5cc",
        customer,
        items: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          sku: item.sku || 'N/A',
          quantity: item.quantity,
          unitPrice: item.finalPrice || item.unitPrice,
          discount: item.discount || 0,
          unit: item.unit || 'piece',
          image: item.image || ''
        })),
        subtotal,
        discountAmount: savingAmount,
        taxAmount: tax,
        shippingCharge: shipping,
        totalAmount: total,
        payment: {
          method: paymentMethod,
          status: paymentMethod === "online" ? "completed" : "pending"
        },
        delivery: {
          expectedDate: new Date(Date.now() + 45 * 60 * 1000),
          slot: deliverySlot
        },
        notes: orderNotes,
      };
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to place order');
      }
      
      const order = result.data;
      
      localStorage.removeItem("cart");
      setCart([]);
      setOrderDetails(order);
      setOrderSuccess(true);
      
      // Send confirmation email
      try {
        await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: order.orderId,
            customerEmail: customer.email,
            customerName: customer.name,
            totalAmount: order.totalAmount
          }),
        });
      } catch (emailError) {
        console.log('Email notification failed:', emailError);
      }
      
    } catch (error: any) {
      console.error("Order error:", error);
      alert(`Failed to place order: ${error.message}`);
    } finally {
      setPlacingOrder(false);
    }
  };
  
  // Update quantity
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }
    
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const unitPrice = item.finalPrice || item.unitPrice || 0;
        const maxQty = item.maxQuantity || item.stock || 10;
        const finalQty = Math.min(newQuantity, maxQty);
        
        if (newQuantity > maxQty) {
          alert(`Only ${maxQty} units available`);
        }
        
        return { 
          ...item, 
          quantity: finalQty, 
          totalPrice: unitPrice * finalQty 
        };
      }
      return item;
    }));
  };
  
  // Remove item
  const removeItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };
  
  // Save cart to localStorage
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    const safeAmount = typeof amount === 'number' ? amount : 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(safeAmount);
  };
  
  // Checkout steps for mobile
  const steps = [
    { id: 1, name: "Delivery", icon: MapPin },
    { id: 2, name: "Payment", icon: CreditCard },
    { id: 3, name: "Review", icon: CheckCircle }
  ];
  
  // Delivery slots
  const deliverySlots = [
    { id: "fast", time: "30-45 mins", label: "Express Delivery", icon: Clock },
    { id: "standard", time: "1-2 hours", label: "Standard Delivery", icon: Package },
    { id: "scheduled", time: "Schedule", label: "Choose Time", icon: Clock }
  ];
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-emerald-200 rounded-full"></div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 sm:mt-6 text-gray-700 font-medium text-sm sm:text-base">Loading your order...</p>
      </div>
    );
  }
  
  if (orderSuccess && orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Success Animation */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 sm:w-64 sm:h-64 bg-emerald-300/20 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 text-center border border-gray-200">
              <div className="inline-flex items-center justify-center mb-4 sm:mb-6">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-30"></div>
                </div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Order Confirmed! 🎉
              </h1>
              
              <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">
                Thank you for your order. We'll send a confirmation email with your order details.
              </p>
              
              {/* Order Summary Card */}
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-emerald-500 rounded-lg">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Order Summary</h2>
                  </div>
                  <span className="px-2.5 py-1 sm:px-4 sm:py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm font-semibold">
                    #{orderDetails.orderId}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(orderDetails.totalAmount)}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Delivery Time</p>
                      <p className="font-semibold text-blue-600 text-sm sm:text-base flex items-center gap-2">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        {orderDetails.delivery?.slot}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="font-semibold text-emerald-600 text-sm sm:text-base">{orderDetails.status}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Payment Method</p>
                      <p className="font-semibold text-purple-600 text-sm sm:text-base">
                        {orderDetails.payment?.method === "cod" ? "Cash on Delivery" : "Paid Online"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push("/orders")}
                  className="px-6 py-3 sm:px-8 sm:py-3.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-semibold text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                  Track My Orders
                </button>
                <button
                  onClick={() => router.push("/shop")}
                  className="px-6 py-3 sm:px-8 sm:py-3.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300 font-semibold text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  Continue Shopping
                </button>
              </div>
              
              {/* Trust Badges */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-300">
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                    <span>Order Protected</span>
                  </div>
                  <div className="h-3 sm:h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    <span>Live Tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Mobile Back Button */}
        {isMobile && (
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-emerald-700 mb-4 group transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
        )}
        
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Checkout
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Final step to get your order delivered</p>
        </div>
        
        {/* Mobile Progress Steps */}
        {isMobile && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    activeStep >= step.id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-medium ${
                    activeStep >= step.id ? 'text-emerald-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative">
              <div className="h-1 bg-gray-200 rounded-full"></div>
              <div 
                className="absolute top-0 left-0 h-1 bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Desktop Progress Steps */}
        {!isMobile && (
          <div className="mb-8">
            <div className="flex items-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl border-2 transition-all ${
                    activeStep >= step.id
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${
                      activeStep >= step.id ? 'text-emerald-600' : 'text-gray-500'
                    }`}>
                      Step {step.id}
                    </p>
                    <p className={`font-semibold ${
                      activeStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.name}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 w-16 mx-4 rounded-full ${
                      activeStep > step.id ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Customer Details Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 sm:p-2 bg-emerald-500 rounded-lg">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Customer Details</h2>
                </div>
                <p className="text-gray-600 text-sm">Enter your information for delivery</p>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      <User className="w-3 h-3 sm:w-4 h-4 inline mr-1" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={customer.name}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      <Mail className="w-3 h-3 sm:w-4 h-4 inline mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={customer.email}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <Phone className="w-3 h-3 sm:w-4 h-4 inline mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customer.phone}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                
                {/* Address Section */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg">
                      <Home className="w-4 h-4 sm:w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Shipping Address</h3>
                  </div>
                  
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      <Map className="w-3 h-3 sm:w-4 h-4 inline mr-1" />
                      Street Address *
                    </label>
                    <textarea
                      name="address.street"
                      value={customer.address.street}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-900 placeholder-gray-500 resize-none text-sm sm:text-base"
                      placeholder="House no., Building, Street, Area"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 sm:mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        <Building className="w-3 h-3 sm:w-4 h-4 inline mr-1" />
                        City *
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={customer.address.city}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                        placeholder="Mumbai"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        <Navigation className="w-3 h-3 sm:w-4 h-4 inline mr-1" />
                        State *
                      </label>
                      <input
                        type="text"
                        name="address.state"
                        value={customer.address.state}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                        placeholder="Maharashtra"
                        required
                      />
                    </div>
                    
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        <MapPin className="w-3 h-3 sm:w-4 h-4 inline mr-1" />
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="address.pincode"
                        value={customer.address.pincode}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                        placeholder="400001"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="address.landmark"
                      value={customer.address.landmark}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                      placeholder="Nearby landmark for easy delivery"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Delivery Options */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg">
                  <Truck className="w-4 h-4 sm:w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Delivery Options</h2>
                  <p className="text-gray-600 text-sm">Choose your preferred delivery slot</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {deliverySlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => {
                      setDeliverySlot(slot.time);
                      setActiveStep(2);
                    }}
                    className={`p-3 sm:p-4 rounded-lg border transition-all ${
                      deliverySlot === slot.time
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-300 hover:border-emerald-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`p-1.5 sm:p-2 rounded ${
                        deliverySlot === slot.time
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <slot.icon className="w-3 h-3 sm:w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">{slot.label}</p>
                        <p className={`text-xs sm:text-sm ${
                          deliverySlot === slot.time ? 'text-emerald-600' : 'text-gray-600'
                        }`}>
                          {slot.time}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {deliverySlot === "30-45 mins" && (
                <div className="mt-3 sm:mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 sm:w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-emerald-700">
                      Order within next 15 minutes for guaranteed same-day delivery
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Payment Method */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 bg-purple-500 rounded-lg">
                  <CreditCard className="w-4 h-4 sm:w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Payment Method</h2>
                  <p className="text-gray-600 text-sm">Choose how you want to pay</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setPaymentMethod("cod");
                    setActiveStep(3);
                  }}
                  className={`w-full p-3 sm:p-4 rounded-lg border transition-all ${
                    paymentMethod === "cod"
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-300 hover:border-emerald-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`p-1.5 sm:p-2 rounded ${
                        paymentMethod === "cod"
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <CreditCard className="w-4 h-4 sm:w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">Cash on Delivery</p>
                        <p className="text-gray-600 text-xs sm:text-sm">Pay when you receive your order</p>
                      </div>
                    </div>
                    {paymentMethod === "cod" && (
                      <Check className="w-5 h-5 sm:w-6 h-6 text-emerald-500" />
                    )}
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setPaymentMethod("online");
                    setActiveStep(3);
                  }}
                  className={`w-full p-3 sm:p-4 rounded-lg border transition-all ${
                    paymentMethod === "online"
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-300 hover:border-emerald-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`p-1.5 sm:p-2 rounded ${
                        paymentMethod === "online"
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Lock className="w-4 h-4 sm:w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">Online Payment</p>
                        <p className="text-gray-600 text-xs sm:text-sm">Pay securely with UPI, Cards, Net Banking</p>
                        {paymentMethod === "online" && (
                          <span className="text-xs text-emerald-600 font-medium mt-1 block">
                            Get ₹20 instant discount
                          </span>
                        )}
                      </div>
                    </div>
                    {paymentMethod === "online" && (
                      <Check className="w-5 h-5 sm:w-6 h-6 text-emerald-500" />
                    )}
                  </div>
                </button>
              </div>
              
              {/* Security Note */}
              <div className="mt-4 sm:mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2 sm:gap-3">
                  <ShieldCheck className="w-4 h-4 sm:w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-blue-700">
                    Your payment information is encrypted and secure. We never store your card details.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Order Notes */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Additional Instructions</h3>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={3}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-900 placeholder-gray-500 resize-none text-sm sm:text-base"
                placeholder="Add any special instructions for delivery..."
              />
            </div>
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            {/* Mobile Order Summary Toggle */}
            {isMobile && (
              <div className="mb-4">
                <button
                  onClick={() => setShowOrderSummary(!showOrderSummary)}
                  className="w-full bg-white rounded-lg border border-gray-300 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500 rounded-lg">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900">Order Summary</p>
                      <p className="text-sm text-gray-600">{cart.length} items • {formatCurrency(total)}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${showOrderSummary ? 'rotate-90' : ''}`} />
                </button>
              </div>
            )}
            
            {/* Desktop Order Summary */}
            {(!isMobile || showOrderSummary) && (
              <div className={`bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${isMobile ? 'mb-4' : 'sticky top-4'}`}>
                {/* Header */}
                <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-1.5 sm:p-2 bg-emerald-500 rounded-lg">
                      <ShoppingCart className="w-4 h-4 sm:w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Order Summary</h2>
                  </div>
                  <p className="text-gray-600 text-sm">{cart.length} items in cart</p>
                  {isMobile && (
                    <button
                      onClick={() => setShowOrderSummary(false)}
                      className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                {/* Cart Items */}
                <div className="p-4 sm:p-6 max-h-80 overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ShoppingCart className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500">Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item) => {
                        const safeUnitPrice = item.finalPrice || item.unitPrice || 0;
                        const safeQuantity = item.quantity || 1;
                        const safeTotalPrice = safeUnitPrice * safeQuantity;
                        
                        return (
                          <div key={item.productId} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-start gap-3">
                              {/* Product Image */}
                              <div className="relative w-12 h-12 bg-white rounded border overflow-hidden flex-shrink-0">
                                {item.image ? (
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  {safeQuantity}
                                </div>
                              </div>
                              
                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                                <p className="text-xs text-gray-600 mt-0.5">{item.unit}</p>
                                
                                {/* Quantity Controls */}
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => updateQuantity(item.productId, safeQuantity - 1)}
                                      className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
                                      aria-label="Decrease quantity"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-sm text-gray-900 font-medium w-6 text-center">{safeQuantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item.productId, safeQuantity + 1)}
                                      className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
                                      aria-label="Increase quantity"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                  
                                  <div className="text-right">
                                    <p className="font-semibold text-gray-900 text-sm">{formatCurrency(safeTotalPrice)}</p>
                                    <p className="text-xs text-gray-500">{formatCurrency(safeUnitPrice)} each</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {/* Totals */}
                <div className="p-4 sm:p-6 border-t border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Subtotal</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                    </div>
                    
                    {savingAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-600 font-medium">Product Savings</span>
                        <span className="font-bold text-emerald-600">-{formatCurrency(savingAmount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Tax (18% GST)</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(tax)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Delivery</span>
                      <span className="font-semibold text-gray-900">
                        {shipping === 0 ? (
                          <span className="text-emerald-600 font-medium">FREE</span>
                        ) : (
                          formatCurrency(shipping)
                        )}
                      </span>
                    </div>
                    
                    {/* Divider */}
                    <div className="border-t border-gray-300 pt-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-900 text-base">Total Amount</p>
                          <p className="text-xs text-gray-600">Inclusive of all taxes</p>
                        </div>
                        <p className="text-xl font-bold text-emerald-600">
                          {formatCurrency(total)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Savings Summary */}
                    {(savingAmount > 0) && (
                      <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-emerald-700">Total Savings</span>
                          <span className="font-bold text-emerald-700 text-sm">
                            {formatCurrency(savingAmount)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Security & Delivery Info */}
                <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Delivery in {deliverySlot}</p>
                        <p className="text-xs text-gray-600">Order now for fastest delivery</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">100% Secure Checkout</p>
                        <p className="text-xs text-gray-600">SSL encrypted payment</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Place Order Button */}
                <div className="p-4 sm:p-6 border-t border-gray-200">
                  <button
                    onClick={placeOrder}
                    disabled={cart.length === 0 || placingOrder}
                    className="w-full py-3 sm:py-3.5 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {placingOrder ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                        <span className="text-sm sm:text-base">Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 sm:w-5 h-5" />
                        <span className="text-sm sm:text-base">Place Order • {formatCurrency(total)}</span>
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-3">
                    By placing your order, you agree to our{" "}
                    <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Terms & Conditions
                    </a>
                  </p>
                </div>
              </div>
            )}
            
            {/* Desktop Trust Badges */}
            {!isMobile && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                  <Truck className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700">Free Delivery</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                  <Shield className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700">Quality Checked</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                  <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700">30-min Delivery</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                  <Gift className="w-4 h-4 text-red-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700">Fresh Guarantee</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Bottom Bar */}
        {isMobile && cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-emerald-600">{formatCurrency(total)}</p>
              </div>
              <button
                onClick={placeOrder}
                disabled={placingOrder}
                className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {placingOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Place Order
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              By placing order, you agree to our{" "}
              <a href="#" className="text-emerald-600 font-medium">Terms</a>
            </p>
          </div>
        )}
        
        {/* Mobile Trust Badges */}
        {isMobile && (
          <div className="mt-4 mb-20 grid grid-cols-4 gap-2">
            <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
              <Truck className="w-3 h-3 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-gray-700">Free Delivery</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
              <Shield className="w-3 h-3 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs text-gray-700">Secure</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
              <Clock className="w-3 h-3 text-amber-500 mx-auto mb-1" />
              <p className="text-xs text-gray-700">Fast</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
              <Gift className="w-3 h-3 text-red-500 mx-auto mb-1" />
              <p className="text-xs text-gray-700">Fresh</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}