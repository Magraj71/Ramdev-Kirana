"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { Eye, EyeOff, ShoppingBag, Store, LogIn, Shield, Smartphone, TrendingUp, Users, Package } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);

      await axios.post(
        "/api/auth/login",
        { email, password, rememberMe },
        { withCredentials: true }
      );


      router.push("/dashboard");
    } catch (error: any) {
      setError(error.response?.data?.message || "Invalid email or password");
      // Clear password on error
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50/50 via-white to-orange-50/50 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-green-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/4 -right-16 w-48 h-48 bg-orange-100 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-32 h-32 bg-yellow-100 rounded-full opacity-20 animate-pulse delay-500"></div>
        <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-emerald-100 rounded-full opacity-10"></div>
      </div>

      {/* Floating grocery icons */}
      <div className="absolute top-10 left-10 animate-float">
        <Package className="w-8 h-8 text-green-400" />
      </div>
      <div className="absolute top-20 right-20 animate-float-delayed">
        <ShoppingBag className="w-8 h-8 text-orange-400" />
      </div>
      <div className="absolute bottom-32 left-20 animate-float">
        <Store className="w-8 h-8 text-emerald-400" />
      </div>

      <div className="relative w-full max-w-6xl flex flex-col md:flex-row rounded-3xl shadow-2xl overflow-hidden border border-white/50 backdrop-blur-sm bg-white/95">
        {/* Left Side - Brand Showcase */}
        <div className="md:w-2/5 bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 text-white p-8 md:p-12 relative overflow-hidden">
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)`,
              backgroundSize: '100px 100px'
            }}></div>
          </div>

          <div className="relative z-10">
            {/* Logo & Brand */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Kirana<span className="text-yellow-300">Pro</span></h1>
                  <p className="text-emerald-200 text-sm mt-1">Smart Store Management</p>
                </div>
              </div>
              <p className="text-emerald-100 text-lg leading-relaxed">
                Transform your local Kirana store with digital management tools
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 mb-12">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm hover:bg-white/15 transition-colors">
                <div className="p-2 bg-white/20 rounded-lg w-fit mb-2">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm">Mobile App</h3>
                <p className="text-emerald-200 text-xs mt-1">Manage on the go</p>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm hover:bg-white/15 transition-colors">
                <div className="p-2 bg-white/20 rounded-lg w-fit mb-2">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm">Sales Analytics</h3>
                <p className="text-emerald-200 text-xs mt-1">Real-time insights</p>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm hover:bg-white/15 transition-colors">
                <div className="p-2 bg-white/20 rounded-lg w-fit mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm">Customer CRM</h3>
                <p className="text-emerald-200 text-xs mt-1">Build loyalty</p>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm hover:bg-white/15 transition-colors">
                <div className="p-2 bg-white/20 rounded-lg w-fit mb-2">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm">Inventory</h3>
                <p className="text-emerald-200 text-xs mt-1">Smart tracking</p>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-300 rounded-full flex items-center justify-center">
                  <span className="font-bold text-emerald-800">RS</span>
                </div>
                <div>
                  <h4 className="font-semibold">Ramdev Enterpirses</h4>
                  <p className="text-emerald-200 text-xs">Cheraj,Jodhpur, Rajasthan</p>
                </div>
              </div>
              <p className="text-emerald-100 text-sm italic">
                "Increased my monthly sales by 40% with KiranaPro's analytics"
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="md:w-3/5 p-8 md:p-12">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl mb-5 shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl flex items-center justify-center">
                  <LogIn className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Welcome Back!</h2>
              <p className="text-gray-600 mt-2">
                Access your store dashboard and manage everything in one place
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                    <p className="text-red-600 text-xs mt-1">Please check your credentials</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <div className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Store Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    className="w-full rounded-xl border text-black border-gray-200 bg-gray-50 px-4 py-3.5 pl-12 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all group-hover:border-emerald-300"
                    placeholder="owner@store.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-emerald-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-medium transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded-xl text-black border border-gray-200 bg-gray-50 px-4 py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all group-hover:border-emerald-300"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-emerald-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Quick Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <label
                      htmlFor="remember"
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${rememberMe ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-emerald-400'}`}
                    >
                      {rememberMe && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </label>
                  </div>
                  <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                    Remember this device
                  </label>
                </div>
                <div className="text-xs text-gray-500">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Secure connection
                </div>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={loading || !email || !password}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Store className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Login to Store Dashboard
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">New to KiranaPro?</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Signup Link & Demo */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Don't have a store account?{" "}
                <Link
                  href="/signup"
                  className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline inline-flex items-center gap-1 group"
                >
                  Create Store Account
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </p>

              {/* Demo Account CTA */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl border border-blue-100">
                <p className="text-sm text-gray-700 mb-2">Want to explore first?</p>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  Try Demo Dashboard
                </Link>
              </div>

              {/* Security Footer */}
              <p className="text-xs text-gray-500 mt-6 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Your data is protected with 256-bit encryption
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}

    </div>
  );
}