// app/checkout/page.tsx (Improved UI)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Calendar } from "lucide-react";

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
  CalendarDays,
  AlertCircle,
  Sparkles,
  Gift,
  RefreshCw,
  Heart,
  Star
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
  
  // Calculate totals with better formatting
  const subtotal = cart.reduce((sum, item) => {
    const price = item.finalPrice || item.unitPrice || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);
  
  const tax = 0; // 18% GST
  const shipping = subtotal > 500 ? 0 : 0;
  // const total = Math.max(0, subtotal + tax + shipping - (paymentMethod === "online" ? 0 : 0));
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
  
// app/checkout/page.tsx में

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
    
    // ✅ Debug: Check cart data
    console.log('🛒 Cart items before order:', cart);
    
    // ✅ Prepare order data
    const orderData = {
      storeId: "6953d5b93bf16cfe78d9a5cc", // Your store ID from database
      customer,
      items: cart.map(item => {
        console.log('📝 Processing cart item:', {
          name: item.name,
          productId: item.productId,
          type: typeof item.productId,
          hasProductId: !!item.productId
        });
        
        return {
          productId: item.productId, // This should be "6953d66b3bf16cfe78d9a60e" format
          name: item.name,
          sku: item.sku || 'N/A',
          quantity: item.quantity,
          unitPrice: item.finalPrice || item.unitPrice,
          discount: item.discount || 0,
          unit: item.unit || 'piece',
          image: item.image || ''
        };
      }),
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
        expectedDate: new Date(Date.now() + 45 * 60 * 1000) // 45 minutes from now
      },
      notes: orderNotes,
      // createdBy: "user" // Or user ID if logged in
    };
    
    console.log('📤 Sending order data:', orderData);
    
    // ✅ Real API call
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    const result = await response.json();
    console.log('📥 API Response:', result);
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to place order');
    }
    
    // ✅ Success
    const order = result.data;
    
    // Clear cart
    localStorage.removeItem("cart");
    setCart([]);
    setOrderDetails(order);
    setOrderSuccess(true);
    
    // ✅ Optional: Send confirmation email
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
    console.error("❌ Order error:", error);
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
  
  // Checkout steps
  const steps = [
    { id: 1, name: "Delivery", icon: MapPin },
    { id: 2, name: "Payment", icon: CreditCard },
    { id: 3, name: "Review", icon: CheckCircle }
  ];
  
  // Delivery slots
  const deliverySlots = [
    { id: "fast", time: "30-45 mins", label: "Express Delivery", icon: Clock },
    { id: "standard", time: "1-2 hours", label: "Standard Delivery", icon: Package },
    { id: "scheduled", time: "Schedule", label: "Choose Time", icon: Calendar }
  ];
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-emerald-200 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="mt-6 text-gray-700 font-medium">Loading your order...</p>
      </div>
    );
  }
  
  if (orderSuccess && orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Success Animation */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 bg-gradient-to-r from-emerald-300/20 to-teal-300/20 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-30"></div>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                Order Confirmed! 🎉
              </h1>
              
              <p className="text-gray-700 text-lg mb-8 max-w-md mx-auto">
                Thank you for your order. We'll send a confirmation email with your order details.
              </p>
              
              {/* Order Summary Card */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200/50 p-6 mb-8 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                      <Package className="w-5 h-5 text-black" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                  </div>
                  <span className="px-4 py-1.5 bg-gradient-to-r text-black from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-sm font-semibold">
                    #{orderDetails.orderId}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(orderDetails.totalAmount)}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Delivery Time</p>
                      <p className="font-semibold text-blue-700 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {orderDetails.delivery?.slot}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="font-semibold text-emerald-700">{orderDetails.status}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                      <p className="font-semibold text-purple-700">
                        {orderDetails.payment?.method === "cod" ? "Cash on Delivery" : "Paid Online"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push("/orders")}
                  className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 font-semibold flex items-center justify-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  Track My Orders
                </button>
                <button
                  onClick={() => router.push("/shop")}
                  className="px-8 py-3.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-100 transition-all duration-300 border-2 border-gray-300/50 hover:border-emerald-300 font-semibold flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Continue Shopping
                </button>
              </div>
              
              {/* Trust Badges */}
              <div className="mt-8 pt-6 border-t border-gray-300/50">
                <div className="flex flex-wrap items-center justify-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Order Protected</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-4 h-4 text-blue-500" />
                    <span>Live Tracking</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <RefreshCw className="w-4 h-4 text-amber-500" />
                    <span>Easy Returns</span>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/shop")}
          className="flex items-center gap-2 text-gray-700 hover:text-emerald-700 mb-8 group transition-colors"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Shop</span>
        </button>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            Complete Your Order
          </h1>
          <p className="text-gray-700">Final step to get your fresh groceries delivered</p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all duration-300 ${
                  activeStep >= step.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-500 text-white shadow-lg shadow-emerald-200'
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
                  <div className={`h-1 w-16 mx-4 rounded-full transition-all duration-300 ${
                    activeStep > step.id
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Details Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
                </div>
                <p className="text-gray-600">Enter your information for delivery</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={customer.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-gradient-to-r from-gray-50 to-gray-100/50 border-2 border-gray-300/50 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 text-gray-900 placeholder-gray-500 transition-colors"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={customer.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-gradient-to-r from-gray-50 to-gray-100/50 border-2 border-gray-300/50 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 text-gray-900 placeholder-gray-500 transition-colors"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customer.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-gradient-to-r from-gray-50 to-gray-100/50 border-2 border-gray-300/50 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 text-gray-900 placeholder-gray-500 transition-colors"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                
                {/* Address Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                      <Home className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Shipping Address</h3>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      <Map className="w-4 h-4 inline mr-2" />
                      Street Address *
                    </label>
                    <textarea
                      name="address.street"
                      value={customer.address.street}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3.5 bg-gradient-to-r from-gray-50 to-gray-100/50 border-2 border-gray-300/50 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 text-gray-900 placeholder-gray-500 resize-none transition-colors"
                      placeholder="House no., Building, Street, Area"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        <Building className="w-4 h-4 inline mr-2" />
                        City *
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={customer.address.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-gradient-to-r from-gray-50 to-gray-100/50 border-2 border-gray-300/50 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 text-gray-900 placeholder-gray-500 transition-colors"
                        placeholder="Mumbai"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        <Navigation className="w-4 h-4 inline mr-2" />
                        State *
                      </label>
                      <input
                        type="text"
                        name="address.state"
                        value={customer.address.state}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-gradient-to-r from-gray-50 to-gray-100/50 border-2 border-gray-300/50 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 text-gray-900 placeholder-gray-500 transition-colors"
                        placeholder="Maharashtra"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="address.pincode"
                        value={customer.address.pincode}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-gradient-to-r from-gray-50 to-gray-100/50 border-2 border-gray-300/50 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 text-gray-900 placeholder-gray-500 transition-colors"
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
                      className="w-full px-4 py-3.5 bg-gradient-to-r from-gray-50 to-gray-100/50 border-2 border-gray-300/50 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 text-gray-900 placeholder-gray-500 transition-colors"
                      placeholder="Nearby landmark for easy delivery"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Delivery Options */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delivery Options</h2>
                  <p className="text-gray-600">Choose your preferred delivery slot</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {deliverySlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => {
                      setDeliverySlot(slot.time);
                      setActiveStep(2);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      deliverySlot === slot.time
                        ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50'
                        : 'border-gray-300/50 hover:border-emerald-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        deliverySlot === slot.time
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <slot.icon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{slot.label}</p>
                        <p className={`text-sm ${
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
                <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <p className="text-sm text-emerald-700 font-medium">
                      Order within next 15 minutes for guaranteed same-day delivery
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                  <p className="text-gray-600">Choose how you want to pay</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setPaymentMethod("cod");
                    setActiveStep(3);
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                    paymentMethod === "cod"
                      ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50'
                      : 'border-gray-300/50 hover:border-emerald-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        paymentMethod === "cod"
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">Cash on Delivery</p>
                        <p className="text-sm text-gray-600">Pay when you receive your order</p>
                      </div>
                    </div>
                    {paymentMethod === "cod" && (
                      <Check className="w-6 h-6 text-emerald-500" />
                    )}
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setPaymentMethod("online");
                    setActiveStep(3);
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                    paymentMethod === "online"
                      ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50'
                      : 'border-gray-300/50 hover:border-emerald-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        paymentMethod === "online"
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Lock className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">Online Payment</p>
                        <p className="text-sm text-gray-600">Pay securely with UPI, Cards, Net Banking</p>
                        {paymentMethod === "online" && (
                          <span className="text-xs text-emerald-600 font-medium mt-1">
                            Get ₹20 instant discount
                          </span>
                        )}
                      </div>
                    </div>
                    {paymentMethod === "online" && (
                      <Check className="w-6 h-6 text-emerald-500" />
                    )}
                  </div>
                </button>
              </div>
              
              {/* Security Note */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-700">
                    Your payment information is encrypted and secure. We never store your card details.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Order Notes */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Instructions</h3>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3.5 bg-gradient-to-r from-gray-50 to-gray-100/50 border-2 border-gray-300/50 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 text-gray-900 placeholder-gray-500 resize-none transition-colors"
                placeholder="Add any special instructions for delivery..."
              />
            </div>
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                  </div>
                  <p className="text-gray-600">{cart.length} items in cart</p>
                </div>
                
                {/* Cart Items */}
                <div className="p-6 max-h-96 overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500">Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => {
                        const safeUnitPrice = item.finalPrice || item.unitPrice || 0;
                        const safeQuantity = item.quantity || 1;
                        const safeTotalPrice = safeUnitPrice * safeQuantity;
                        
                        return (
                          <div key={item.productId} className="group relative p-4 bg-gradient-to-r from-gray-50 to-gray-100/30 rounded-xl border border-gray-200/50 hover:border-emerald-300 transition-colors">
                            <div className="flex items-start gap-4">
                              {/* Product Image */}
                              <div className="relative w-16 h-16 bg-gradient-to-br from-white to-gray-100 rounded-lg border overflow-hidden flex-shrink-0">
                                {item.image ? (
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-900" />
                                  </div>
                                )}
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-black rounded-full flex items-center justify-center text-xs font-bold">
                                  {safeQuantity}
                                </div>
                              </div>
                              
                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h4>
                                {item.brand && (
                                  <p className="text-xs text-black">{item.brand}</p>
                                )}
                                <p className="text-sm text-black mt-1">{item.unit}</p>
                                
                                {/* Quantity Controls */}
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => updateQuantity(item.productId, safeQuantity - 1)}
                                      className="w-6 h-6 flex items-center justify-center bg-gray-500 hover:bg-gray-300 rounded transition-colors"
                                    >
                                      -
                                    </button>
                                    <span className="text-sm text-black font-medium">{safeQuantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item.productId, safeQuantity + 1)}
                                      className="w-6 h-6 flex items-center justify-center bg-gray-500 hover:bg-gray-300 rounded transition-colors"
                                    >
                                      +
                                    </button>
                                  </div>
                                  
                                  <div className="text-right">
                                    <p className="font-semibold text-gray-900">{formatCurrency(safeTotalPrice)}</p>
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
                <div className="p-6 border-t border-gray-200/50">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Subtotal</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                    </div>
                    
                    {savingAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-emerald-600 font-medium">Product Savings</span>
                        <span className="font-bold text-emerald-600">-{formatCurrency(savingAmount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-700">Tax (18% GST)</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(tax)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-700">Delivery</span>
                      <span className="font-semibold text-gray-900">
                        {shipping === 0 ? (
                          <span className="text-emerald-600 font-bold">FREE</span>
                        ) : (
                          formatCurrency(shipping)
                        )}
                      </span>
                    </div>
                    
                    {paymentMethod === "online" && (
                      <div className="flex justify-between">
                        <span className="text-emerald-600 font-medium">Online Payment Discount</span>
                        <span className="font-bold text-emerald-600">-{formatCurrency(20)}</span>
                      </div>
                    )}
                    
                    {/* Divider */}
                    <div className="border-t border-dashed border-gray-300 pt-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-lg text-gray-900">Total Amount</p>
                          <p className="text-sm text-gray-600">Inclusive of all taxes</p>
                        </div>
                        <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                          {formatCurrency(total)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Savings Summary */}
                    {(savingAmount > 0 || paymentMethod === "online") && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-emerald-700">Total Savings</span>
                          <span className="font-bold text-emerald-700">
                            {formatCurrency(savingAmount + (paymentMethod === "online" ? 20 : 0))}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Security & Delivery Info */}
                <div className="p-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">Delivery in {deliverySlot}</p>
                        <p className="text-sm text-gray-600">Order now for fastest delivery</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="font-medium text-gray-900">100% Secure Checkout</p>
                        <p className="text-sm text-gray-600">SSL encrypted payment</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Place Order Button */}
                <div className="p-6 border-t border-gray-200/50">
                  <button
                    onClick={placeOrder}
                    disabled={cart.length === 0 || placingOrder}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-emerald-500 disabled:hover:via-emerald-600 disabled:hover:to-teal-500 flex items-center justify-center gap-2"
                  >
                    {placingOrder ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Processing Order...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Place Order • {formatCurrency(total)}
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-4">
                    By placing your order, you agree to our{" "}
                    <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Terms & Conditions
                    </a>
                  </p>
                </div>
              </div>
              
              {/* Trust Badges */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                <div className="bg-white p-3 rounded-xl border border-gray-200/50 text-center">
                  <Truck className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700">Free Delivery</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200/50 text-center">
                  <Shield className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700">Quality Checked</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200/50 text-center">
                  <RefreshCw className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700">Easy Returns</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200/50 text-center">
                  <Heart className="w-4 h-4 text-red-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700">Fresh Guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}