// src/app/cart/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
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
  AlertCircle,
  Loader2
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
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error parsing cart data:", error);
        setCart([]);
      }
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
      setLoading(true);
      const productIds = cart.map(item => item.productId);
      
      // You might want to fetch only specific products instead of all
      const response = await fetch("/api/products/public");
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setLoading(false);
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

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Calculate totals using useMemo for performance
  const { subtotal, shippingCharge, taxRate, taxAmount, total } = useMemo(() => {
    const subtotalValue = cart.reduce((total, item) => {
      const product = getProductDetails(item.productId);
      return total + (product?.finalPrice || 0) * item.quantity;
    }, 0);

    const shippingChargeValue = subtotalValue > 500 ? 0 : 50;
    const taxRateValue = 5; // 5% GST
    const taxAmountValue = (subtotalValue * taxRateValue) / 100;
    const totalValue = subtotalValue + shippingChargeValue + taxAmountValue;

    return {
      subtotal: subtotalValue,
      shippingCharge: shippingChargeValue,
      taxRate: taxRateValue,
      taxAmount: taxAmountValue,
      total: totalValue
    };
  }, [cart, products]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <p className="mt-4 text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 md:p-12 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Add some products to get started</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium sm:font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Shopping Cart</h1>
          <p className="text-gray-600 text-sm sm:text-base">Review your items and proceed to checkout</p>
          <div className="mt-2 text-sm text-gray-500">
            {cart.length} {cart.length === 1 ? 'item' : 'items'} in cart
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              {/* Mobile cart items counter */}
              {isMobile && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Items ({cart.length})</span>
                    <button
                      onClick={clearCart}
                      className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                {cart.map((item) => {
                  const product = getProductDetails(item.productId);
                  if (!product) return null;

                  return (
                    <div 
                      key={item.productId} 
                      className="flex gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex-shrink-0">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0"> {/* min-w-0 prevents overflow */}
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-800 text-sm sm:text-base truncate">
                              {product.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {product.sku} • {product.unit}
                            </p>
                            <div className="mt-1 sm:mt-2">
                              <span className="font-bold text-gray-900 text-sm sm:text-base">
                                {formatCurrency(product.finalPrice)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-start sm:items-end gap-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1 sm:gap-2">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              
                              <span className="w-8 sm:w-10 text-center font-medium text-sm sm:text-base">
                                {item.quantity}
                              </span>
                              
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                disabled={!product.inStock || item.quantity >= product.stock}
                                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                            
                            {/* Price and Remove */}
                            <div className="flex items-center justify-between w-full sm:w-auto sm:gap-4">
                              <span className="font-bold text-gray-900 text-sm sm:text-base">
                                {formatCurrency(product.finalPrice * item.quantity)}
                              </span>
                              <button
                                onClick={() => removeFromCart(item.productId)}
                                className="text-red-500 hover:text-red-600 flex items-center gap-1 text-xs sm:text-sm ml-4 sm:ml-0"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                {isMobile ? '' : 'Remove'}
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Stock Warning */}
                        <div className="mt-2">
                          {!product.inStock && (
                            <div className="flex items-center gap-1 text-red-600 text-xs sm:text-sm bg-red-50 px-2 py-1 rounded">
                              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span>Out of stock</span>
                            </div>
                          )}
                          
                          {product.inStock && item.quantity > product.stock && (
                            <div className="flex items-center gap-1 text-amber-600 text-xs sm:text-sm bg-amber-50 px-2 py-1 rounded">
                              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span>Only {product.stock} available</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium px-4 py-2.5 border border-emerald-200 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Link>
                {!isMobile && (
                  <button
                    onClick={clearCart}
                    className="inline-flex items-center justify-center gap-2 text-red-500 hover:text-red-600 font-medium px-4 py-2.5 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Cart
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary - Sticky on mobile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 sticky top-20 sm:top-24">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">Order Summary</h2>
              
              {/* Price Breakdown */}
              <div className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingCharge === 0 ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      formatCurrency(shippingCharge)
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Tax (GST {taxRate}%)</span>
                  <span className="font-medium">{formatCurrency(taxAmount)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-base sm:text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {shippingCharge === 0 ? 'Free shipping applied' : 'Add ₹' + (500 - subtotal).toFixed(2) + ' for free shipping'}
                  </p>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="block w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold py-3 sm:py-3.5 rounded-lg text-center transition-colors mb-4 sm:mb-6"
              >
                Proceed to Checkout
              </Link>

              {/* Trust Signals */}
              <div className="space-y-2.5 sm:space-y-3 pt-4 sm:pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2.5 text-gray-600">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Free delivery on orders above ₹500</span>
                </div>
                
                <div className="flex items-center gap-2.5 text-gray-600">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Secure payment with SSL encryption</span>
                </div>
                
                <div className="flex items-center gap-2.5 text-gray-600">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Cash on delivery available</span>
                </div>
              </div>

              {/* Mobile payment methods */}
              {isMobile && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">We accept:</p>
                  <div className="flex gap-2">
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">Visa</div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">MasterCard</div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">UPI</div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">COD</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}