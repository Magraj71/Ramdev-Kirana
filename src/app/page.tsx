"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  Store, 
  Users, 
  Package, 
  BarChart3, 
  Truck, 
  Shield, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  Star,
  Award,
  TrendingUp,
  Clock,
  DollarSign,
  Heart,
  ChevronRight,
  Menu,
  X,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Store as StoreIcon,
  UserPlus,
  LogIn
} from "lucide-react";
import Link from "next/link";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  store: string;
}

interface Stat {
  value: string;
  label: string;
  icon: React.ElementType;
}

export default function HomePage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Store Owner Information - Updated with Sukharam Jakhar's details
  const storeOwner = {
    name: "Sukharam Jakhar",
    storeName: "Ramdev Enterprises",
    location: "Cherai, Jodhpur",
    address: "Bus Stand Main Market, Cherai",
    phone: "+91 9602135397",
    email: "ramdeventerprises@example.com",
    yearsInBusiness: 12,
    customersDaily: 150,
    monthlyRevenue: "₹8.5 Lakhs+"
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features: Feature[] = [
    { icon: Store, title: "Digital Storefront", description: "Your store online 24/7 with beautiful digital presence" },
    { icon: Package, title: "Smart Inventory", description: "Automated stock tracking and low stock alerts" },
    { icon: BarChart3, title: "Sales Analytics", description: "Real-time insights and business performance metrics" },
    { icon: Users, title: "Customer CRM", description: "Build loyal customer base with personalized offers" },
    { icon: Truck, title: "Delivery Management", description: "Seamless order fulfillment and tracking" },
    { icon: Smartphone, title: "Mobile App", description: "Manage your store from anywhere, anytime" },
  ];

  const testimonials: Testimonial[] = [
    { 
      name: "Sukharam Jakhar", 
      role: "Store Owner", 
      content: "This platform increased my monthly revenue by 45% in just 3 months. The analytics helped me understand customer behavior better.", 
      rating: 5, 
      store: "Ramdev Enterprises, Cherai, Jodhpur" 
    },
    { 
      name: "Mohanlal Sharma", 
      role: "Supermarket Owner", 
      content: "Managing inventory was always a challenge. Now with this system, I save 15+ hours every week on manual tasks.", 
      rating: 5, 
      store: "Sharma Supermarket, Jodhpur" 
    },
    { 
      name: "Ramesh Kumar", 
      role: "Convenience Store", 
      content: "The digital billing and customer management features have transformed how I run my store. Highly recommended!", 
      rating: 5, 
      store: "Kumar General Store, Jodhpur" 
    },
  ];

  const stats: Stat[] = [
    { value: "12 Years", label: "Store Experience", icon: StoreIcon },
    { value: "150+", label: "Daily Customers", icon: Users },
    { value: "₹8.5L+", label: "Monthly Revenue", icon: DollarSign },
    { value: "24/7", label: "Digital Store", icon: Heart },
  ];

  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/30">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">Ramdev<span className="text-emerald-600">Pro</span></span>
                <p className="text-xs text-gray-600 -mt-1">Smart Store Management</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">How it Works</a>
              <a href="#testimonials" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">Success Stories</a>
              <a href="#pricing" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">Pricing</a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link 
                href="/login" 
                className="px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Sign In
              </Link>
              <button
                onClick={handleGetStarted}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <a href="#features" className="block px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors">Features</a>
              <a href="#how-it-works" className="block px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors">How it Works</a>
              <a href="#testimonials" className="block px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors">Success Stories</a>
              <a href="#pricing" className="block px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors">Pricing</a>
              <div className="pt-4 space-y-3">
                <Link 
                  href="/login" 
                  className="block w-full px-4 py-2.5 text-center text-emerald-600 border-2 border-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors"
                >
                  Sign In
                </Link>
                <button
                  onClick={handleGetStarted}
                  className="block w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-100 rounded-full translate-x-1/3 translate-y-1/3 opacity-50"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge - Updated with store info */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full mb-8">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Since 2011 - {storeOwner.storeName}, {storeOwner.location}</span>
            </div>

            {/* Main Heading - Updated */}
            <h1 className="text-5xl sm:text-4xl lg:text-7xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-emerald-600">{storeOwner.storeName}</span><br />
              Your Trusted Store in <span className="text-emerald-600">{storeOwner.location}</span>
            </h1>

            {/* Subheading - Updated */}
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Serving the community of Cherai for over <span className="font-bold text-emerald-600">12 years</span>. 
              Now with digital store management to serve you better, faster, and smarter.
            </p>

            {/* Store Owner Info Card */}
            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-6 mb-10 max-w-md mx-auto border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-white">SJ</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{storeOwner.name}</h3>
                  <p className="text-gray-600">Proprietor - {storeOwner.storeName}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span className="text-gray-500">{storeOwner.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <a href={`tel:${storeOwner.phone}`}className="text-gray-500 hover:text-emerald-600">
                    {storeOwner.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 text-lg group"
              >
                <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Start Digital Journey - Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <Link 
                href="/signup" 
                className="px-8 py-4 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold rounded-2xl transition-all duration-300 flex items-center gap-3 text-lg group"
              >
                <UserPlus className="w-5 h-5" />
                Create Store Account
              </Link>
            </div>

            {/* Stats - Updated */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center p-4 bg-white rounded-xl border border-emerald-100 shadow-sm">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-emerald-600" />
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powered by RamdevPro - Digital tools for modern store management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="p-3 bg-emerald-50 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-emerald-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Ramdev Enterprises Transformed</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From traditional store to digital powerhouse in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl border border-emerald-100">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-emerald-600">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Digital Onboarding</h3>
              <p className="text-gray-600">
                Sukharam Jakhar signed up and set up his digital store in just 2 days.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl border border-emerald-100">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-emerald-600">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Inventory Setup</h3>
              <p className="text-gray-600">
                Automated stock tracking reduced waste by 30% and increased profits.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl border border-emerald-100">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-emerald-600">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Revenue Growth</h3>
              <p className="text-gray-600">
                Monthly revenue increased by 45% with digital customer management.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg"
            >
              Transform Your Store Like Ramdev Enterprises
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories from Jodhpur Store Owners</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what local store owners are saying about digital transformation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-emerald-600">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    <p className="text-emerald-600 text-sm font-medium">{testimonial.store}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Store Information Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-50 to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Visit Ramdev Enterprises</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your trusted neighborhood store in Cherai, Jodhpur
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Store Details */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Store Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <Store className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">Store Name</h4>
                    <p className="text-gray-700">{storeOwner.storeName}</p>
                    <p className="text-gray-600 text-sm">{storeOwner.address}</p>
                    <p className="text-gray-600 text-sm">{storeOwner.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <Clock className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">Opening Hours</h4>
                    <p className="text-gray-700">Monday - Saturday: 7:00 AM - 10:00 PM</p>
                    <p className="text-gray-700">Sunday: 8:00 AM - 9:00 PM</p>
                    <p className="text-gray-600 text-sm">Festival Days: Open 24 Hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <Phone className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">Contact Information</h4>
                    <p className="text-gray-700">
                      <a href={`tel:${storeOwner.phone}`} className="hover:text-emerald-600">
                        {storeOwner.phone}
                      </a>
                    </p>
                    <p className="text-gray-700">
                      <a href={`mailto:${storeOwner.email}`} className="hover:text-emerald-600">
                        {storeOwner.email}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <Award className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">Business Since</h4>
                    <p className="text-gray-700">{storeOwner.yearsInBusiness} Years</p>
                    <p className="text-gray-600 text-sm">Serving Cherai since 2011</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Offered */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Our Services</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Daily Grocery & Provisions",
                  "Bulk Orders for Functions",
                  "Home Delivery Service",
                  "Credit Facility (Trusted Customers)",
                  "Fresh Vegetables & Fruits",
                  "Kitchen Essentials",
                  "Beverages & Snacks",
                  "Personal Care Products",
                  "Cleaning Supplies",
                  "Emergency Orders 24/7"
                ].map((service, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <CheckCircle className="w-5 h-5" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-white/20">
                <h4 className="font-bold text-lg mb-3">Why Choose {storeOwner.storeName}?</h4>
                <div className="space-y-2">
                  <p className="text-emerald-100">✓ 12+ Years of Trust</p>
                  <p className="text-emerald-100">✓ Quality Guaranteed Products</p>
                  <p className="text-emerald-100">✓ Competitive Prices</p>
                  <p className="text-emerald-100">✓ Personalized Service</p>
                  <p className="text-emerald-100">✓ Community-Focused</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-600 to-green-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Store?</h2>
          <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            Join {storeOwner.storeName} and 500+ stores that have already digitized their business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-white text-emerald-600 hover:bg-gray-50 font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg flex items-center gap-3 justify-center group"
            >
              <LogIn className="w-5 h-5" />
              Start Free 14-Day Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              className="px-8 py-4 border-2 border-white text-white hover:bg-white/10 font-semibold rounded-2xl transition-all duration-300 text-lg"
              onClick={() => window.location.href = `tel:${storeOwner.phone}`}
            >
              Call {storeOwner.storeName}: {storeOwner.phone}
            </button>
          </div>
          <p className="text-emerald-200 text-sm mt-8">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info - Updated */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-600 rounded-xl">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">{storeOwner.storeName}</span>
                  <p className="text-xs text-gray-400">Since 2011 • Cherai, Jodhpur</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6">
                Serving the Cherai community for over 12 years with quality products and exceptional service.
              </p>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href={`https://wa.me/919602135397`} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Success Stories</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-6">Resources</h3>
              <ul className="space-y-3">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Contact - Updated */}
            <div>
              <h3 className="text-white font-semibold mb-6">Contact {storeOwner.storeName}</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${storeOwner.phone}`} className="hover:text-white">
                    {storeOwner.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${storeOwner.email}`} className="hover:text-white">
                    {storeOwner.email}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{storeOwner.address}, {storeOwner.location}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>7AM-10PM, Daily</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} {storeOwner.storeName}. All rights reserved. Made with ❤️ for the people of Cherai, Jodhpur.</p>
            <p className="mt-2">GSTIN: 08AAAAA0000A1Z5 | FSSAI License: 12345678901234</p>
          </div>
        </div>
      </footer>
    </div>
  );
}