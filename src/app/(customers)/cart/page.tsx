// src/app/cart/page.tsx
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft,
  Truck,
  Shield,
  CreditCard,
  AlertCircle
} from "lucide-react";

interface CartItem {
  productId: string;
  quantity: number;
  product?: {
    _id: string;
    name: string;
    sku: string;
    finalPrice: number;
    image?: string;
    unit: string;
    inStock: boolean;
    stock: number;
  };
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setLoading(false);
  }, []);

  // Fetch product details for cart items
  useEffect(() => {
    if (cart.length > 0) {
      fetchProductDetails();
    }
  }, [cart]);

  const fetchProductDetails = async () => {
    try {
      const productIds = cart.map(item => item.productId);
      
      // Fetch all products
      const response = await fetch("/api/products/public");
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  // Update cart in localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Get full product details for cart item
  const getProductDetails = (productId: string) => {
    return products.find(p => p._id === productId);
  };

  // Update quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  // Calculate totals
  const subtotal = cart.reduce((total, item) => {
    const product = getProductDetails(item.productId);
    return total + (product?.finalPrice || 0) * item.quantity;
  }, 0);

  const shippingCharge = subtotal > 500 ? 0 : 50;
  const taxRate = 5; // 5% GST
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + shippingCharge + taxAmount;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          <p className="text-gray-600">Review your items and proceed to checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="space-y-4">
                {cart.map((item) => {
                  const product = getProductDetails(item.productId);
                  if (!product) return null;

                  return (
                    <div key={item.productId} className="flex gap-4 pb-4 border-b border-gray-100">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800">{product.name}</h3>
                            <p className="text-sm text-gray-600">{product.sku} • {product.unit}</p>
                            <div className="mt-2">
                              <span className="font-bold text-gray-900">
                                {formatCurrency(product.finalPrice)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 mb-2">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              
                              <span className="w-10 text-center font-medium">{item.quantity}</span>
                              
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                disabled={!product.inStock || item.quantity >= product.stock}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {/* Remove */}
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="text-red-500 hover:text-red-600 flex items-center gap-1 text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                        
                        {/* Stock Warning */}
                        {!product.inStock && (
                          <div className="mt-2 flex items-center gap-1 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            Out of stock
                          </div>
                        )}
                        
                        {product.inStock && item.quantity > product.stock && (
                          <div className="mt-2 flex items-center gap-1 text-orange-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            Only {product.stock} available
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Shopping */}
              <div className="mt-6">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
              
              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingCharge === 0 ? "FREE" : formatCurrency(shippingCharge)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (GST {taxRate}%)</span>
                  <span className="font-medium">{formatCurrency(taxAmount)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-lg text-center transition-colors mb-4"
              >
                Proceed to Checkout
              </Link>

              {/* Trust Signals */}
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 text-gray-600">
                  <Truck className="w-5 h-5" />
                  <span className="text-sm">Free delivery on orders above ₹500</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">Secure payment</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-sm">Cash on delivery available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}