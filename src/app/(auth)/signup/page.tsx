"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { 
  Eye, 
  EyeOff, 
  ShoppingBag, 
  Store, 
  UserPlus, 
  CheckCircle, 
  User,
  MapPin,
  Building,
  Smartphone,
  Shield,
  ArrowRight,
  Sparkles,
  BadgeCheck,
  Package,
  Users,
  BarChart3,
  Award,
  Mail,
  ChevronDown
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [role, setRole] = useState<"owner" | "user">("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [conformPassword, setConformPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Store fields (only for shop owners)
  const [storeName, setStoreName] = useState("");
  const [storeType, setStoreType] = useState<"kirana" | "supermarket" | "convenience" | "specialty" | "other">("kirana");
  const [storeLocation, setStoreLocation] = useState("");

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [step, setStep] = useState(1);

  const handleSignup = async () => {
    try {
      setError("");
      setFieldErrors({});
      setSuccessMessage("");
      setLoading(true);

      const payload: any = { 
        name, 
        email, 
        phone,
        password, 
        conformPassword, 
        role,
        storeName,
        storeType 
      };

      if (role === "owner") {
        payload.storeName = storeName;
        payload.storeType = storeType;
        payload.storeLocation = storeLocation;
      }

      await axios.post("/api/auth/signup", payload);

      setSuccessMessage(
        role === "owner" 
          ? "Store account created! Setting up your dashboard..."
          : "Account created! Welcome to KiranaMart!"
      );
      
      setTimeout(() => {
        router.push(role === "owner" ? "/login" : "/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
      setFieldErrors(err.response?.data?.errors || {});
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    if (step === 1) {
      if (!name.trim()) return "Name is required";
      if (!email.trim()) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
      if (!phone.trim()) return "Phone number is required";
    }
    return null;
  };

  const nextStep = () => {
    const error = validateStep();
    if (error) {
      setError(error);
      return;
    }
    setError("");
    setStep(2);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50/50 via-white to-orange-50/50 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-green-100 rounded-full opacity-20"></div>
        <div className="absolute top-1/4 -right-16 w-48 h-48 bg-orange-100 rounded-full opacity-20"></div>
        <div className="absolute bottom-32 left-1/4 w-32 h-32 bg-yellow-100 rounded-full opacity-20"></div>
        <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-emerald-100 rounded-full opacity-10"></div>
      </div>

      <div className="relative w-full max-w-6xl flex flex-col lg:flex-row rounded-3xl shadow-2xl overflow-hidden border border-white/50 backdrop-blur-sm bg-white/95">
        
        {/* Left Side - Branding & Role Selection */}
        <div className="lg:w-2/5 bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 text-white p-8 lg:p-12 relative overflow-hidden">
          {/* Pattern overlay - Using CSS classes instead of inline style */}
          <div className="absolute inset-0 opacity-10 bg-dot-pattern"></div>

          <div className="relative z-10">
            {/* Logo */}
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
                Join India's fastest growing digital platform for local stores
              </p>
            </div>

            {/* Role Selector */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Who are you?</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setRole("owner")}
                  className={`p-4 rounded-xl border-2 transition-all ${role === "owner" 
                    ? "border-white bg-white/20 backdrop-blur-sm" 
                    : "border-white/30 hover:border-white/50 hover:bg-white/10"}`}
                  type="button"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-3 rounded-lg mb-3 ${role === "owner" ? "bg-white/30" : "bg-white/10"}`}>
                      <Store className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold">Shop Owner</h3>
                    <p className="text-emerald-200 text-xs mt-1">Manage your store online</p>
                  </div>
                </button>

                <button
                  onClick={() => setRole("user")}
                  className={`p-4 rounded-xl border-2 transition-all ${role === "user" 
                    ? "border-white bg-white/20 backdrop-blur-sm" 
                    : "border-white/30 hover:border-white/50 hover:bg-white/10"}`}
                  type="button"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-3 rounded-lg mb-3 ${role === "user" ? "bg-white/30" : "bg-white/10"}`}>
                      <User className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold">Customer</h3>
                    <p className="text-emerald-200 text-xs mt-1">Shop from local stores</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Features based on role */}
            <div className="space-y-4">
              {role === "owner" ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Digital Storefront</h3>
                      <p className="text-emerald-200 text-sm">Your store online 24/7</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Smart Inventory</h3>
                      <p className="text-emerald-200 text-sm">Automated stock management</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Customer CRM</h3>
                      <p className="text-emerald-200 text-sm">Build customer loyalty</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Local Stores</h3>
                      <p className="text-emerald-200 text-sm">Shop from trusted local stores</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Fast Delivery</h3>
                      <p className="text-emerald-200 text-sm">Quick home delivery</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Best Prices</h3>
                      <p className="text-emerald-200 text-sm">Competitive local prices</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="mt-8 pt-6 border-t border-emerald-500/30">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-emerald-200 text-xs">Stores Registered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-emerald-200 text-xs">Happy Customers</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="lg:w-3/5 p-8 lg:p-12">
          <div className="max-w-lg mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    1
                  </div>
                  <div className={`w-12 h-1 ${step >= 2 ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    2
                  </div>
                </div>
                <span className="text-sm text-gray-500 ml-4">
                  {step === 1 ? "Basic Information" : role === "owner" ? "Store Details" : "Account Setup"}
                </span>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800">
                {step === 1 
                  ? "Create Your Account" 
                  : role === "owner" 
                    ? "Tell us about your store" 
                    : "Set your password"
                }
              </h2>
              <p className="text-gray-600 mt-2">
                {step === 1 
                  ? "Fill in your basic details to get started"
                  : role === "owner"
                    ? "Help us customize your store experience"
                    : "Create a secure password for your account"
                }
              </p>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <p className="text-emerald-700">{successMessage}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            {step === 1 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full px-4 py-3.5 text-black pl-12 rounded-xl border ${
                          fieldErrors.name ? 'border-red-300' : 'border-gray-200'
                        } bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                        placeholder="Enter your full name"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    {fieldErrors.name && (
                      <p className="text-red-500 text-xs mt-2">{fieldErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`w-full px-4 py-3.5 text-black pl-12 rounded-xl border ${
                          fieldErrors.phone ? 'border-red-300' : 'border-gray-200'
                        } bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                        placeholder="+91 XXXXX XXXXX"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Smartphone className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    {fieldErrors.phone && (
                      <p className="text-red-500 text-xs mt-2">{fieldErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-3.5 text-black pl-12 rounded-xl border ${
                        fieldErrors.email ? 'border-red-300' : 'border-gray-200'
                      } bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                      placeholder="you@example.com"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  {fieldErrors.email && (
                    <p className="text-red-500 text-xs mt-2">{fieldErrors.email}</p>
                  )}
                </div>

                <button
                  onClick={nextStep}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                  type="button"
                >
                  Continue to Next Step
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {role === "owner" ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Store Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          className={`w-full px-4 py-3.5 text-black pl-12 rounded-xl border ${
                            fieldErrors.storeName ? 'border-red-300' : 'border-gray-200'
                          } bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                          placeholder="e.g., Rajesh Kirana Store"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <Building className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      {fieldErrors.storeName && (
                        <p className="text-red-500 text-xs mt-2">{fieldErrors.storeName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Store Type *
                        </label>
                        <div className="relative">
                          <select
                            value={storeType}
                            onChange={(e) => setStoreType(e.target.value as any)}
                            className="w-full px-4 py-3.5 text-black pl-12 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none"
                          >
                            <option value="kirana">Kirana Store</option>
                            <option value="supermarket">Supermarket</option>
                            <option value="convenience">Convenience Store</option>
                            <option value="specialty">Specialty Store</option>
                            <option value="other">Other</option>
                          </select>
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            <Store className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Store Location
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={storeLocation}
                            onChange={(e) => setStoreLocation(e.target.value)}
                            className="w-full px-4 py-3.5 text-black pl-12 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            placeholder="City, State"
                          />
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            <MapPin className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Create Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-4 py-3.5 text-black pl-12 pr-12 rounded-xl border ${
                          fieldErrors.password ? 'border-red-300' : 'border-gray-200'
                        } bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                        placeholder="Minimum 8 characters"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Shield className="w-5 h-5 text-gray-400" />
                      </div>
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-red-500 text-xs mt-2">{fieldErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={conformPassword}
                        onChange={(e) => setConformPassword(e.target.value)}
                        className={`w-full px-4 py-3.5 text-black pl-12 pr-12 rounded-xl border ${
                          fieldErrors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                        } bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                        placeholder="Re-enter your password"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Shield className="w-5 h-5 text-gray-400" />
                      </div>
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {fieldErrors.conformPassword && (
                      <p className="text-red-500 text-xs mt-2">{fieldErrors.conformPassword}</p>
                    )}
                  </div>
                </div>

                {/* Password Strength Indicator */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-700 mb-2">Password Strength</p>
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 h-2 rounded-full ${password.length >= 8 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                    <div className={`flex-1 h-2 rounded-full ${/[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                    <div className={`flex-1 h-2 rounded-full ${/[!@#$%^&*]/.test(password) ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Use 8+ characters with letters, numbers & symbols
                  </p>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the{" "}
                    <Link href="/terms" className="text-emerald-600 hover:underline font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-emerald-600 hover:underline font-medium">
                      Privacy Policy
                    </Link>
                    . I understand that {role === "owner" ? "store verification" : "account approval"} may take 24-48 hours.
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border-2 border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 font-semibold py-3.5 rounded-xl transition-all"
                    type="button"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSignup}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                    type="button"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {role === "owner" ? "Creating Store..." : "Creating Account..."}
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        {role === "owner" ? "Create Store Account" : "Create Account"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">Already have an account?</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Ready to {role === "owner" ? "manage your store" : "start shopping"}?{" "}
                <Link
                  href="/login"
                  className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline inline-flex items-center gap-1"
                >
                  Login Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </p>
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Your data is protected with bank-level security
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add dot pattern to global CSS instead of inline style */}
      
    </div>
  );
}