"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Store,
  Shield,
  Save,
  Loader2,
  Camera,
  Key,
  Globe,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  EyeOff,
  ChevronLeft,
  Menu,
  X
} from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  storeName?: string;
  storeType?: string;
  role: "owner" | "user";
  avatar?: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await axios.get("/api/auth/profile");
      
      if (response.data.success) {
        setProfile(response.data.user);
      } else {
        setError(response.data.message || "Failed to load profile");
        if (response.status === 401) {
          router.push("/login");
        }
      }
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => router.push("/login"), 2000);
      } else if (err.response?.status === 403) {
        setError("Access denied. You don't have permission to view this profile.");
      } else {
        setError(err.response?.data?.message || "Failed to load profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const payload: any = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        avatar: profile.avatar
      };

      if (profile.role === "owner") {
        payload.storeName = profile.storeName;
        payload.storeType = profile.storeType;
      }

      const response = await axios.put("/api/auth/profile", payload);
      
      if (response.data.success) {
        setSuccess("Profile updated successfully!");
        setProfile(response.data.user);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message || "Failed to update profile");
      }
    } catch (err: any) {
      console.error("Profile update error:", err);
      
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        router.push("/login");
      } else if (err.response?.status === 400) {
        setError(err.response.data.message || "Invalid input. Please check your details.");
      } else {
        setError(err.response?.data?.message || "Failed to update profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      setSaving(true);

      const response = await axios.post(
        "/api/auth/profile/password",
        passwordData,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setSuccess("Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message || "Failed to update password");
      }
    } catch (err: any) {
      console.error("Password update error:", err);

      if (err.response?.status === 401) {
        setError(err.response.data?.message || "Unauthorized");
      } else if (err.response?.status === 400) {
        setError(err.response.data?.message || "Invalid password format");
      } else {
        setError("Failed to update password. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!profile) return;
    
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Touch-friendly back button handler
  const handleBackClick = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all active:scale-[0.98] touch-manipulation"
              >
                Go to Login
              </button>
              <button
                onClick={fetchProfile}
                className="w-full border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all active:scale-[0.98] touch-manipulation"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackClick}
            className="p-2 -ml-2 touch-manipulation"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -mr-2 touch-manipulation"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="p-4 space-y-2">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push("/settings")}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
              >
                Settings
              </button>
              <button
                onClick={() => router.push("/logout")}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation text-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Header with User Info - Desktop */}
        <div className="mb-8 hidden lg:block">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold select-none">
                  {profile ? getInitials(profile.name) : "U"}
                </div>
                <button 
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all touch-manipulation"
                  aria-label="Change profile picture"
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    profile?.role === 'owner' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {profile?.role === 'owner' ? <Store className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    <span>{profile?.role === 'owner' ? 'Store Owner' : 'Customer'}</span>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    profile?.emailVerified 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {profile?.emailVerified ? <CheckCircle className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                    <span>{profile?.emailVerified ? 'Verified' : 'Unverified'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackClick}
                className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg hover:bg-gray-50 active:scale-[0.98] transition-all touch-manipulation"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
          <p className="text-gray-600 mt-4">Manage your account information, security, and preferences</p>
        </div>

        {/* Mobile Profile Header */}
        <div className="mb-6 lg:hidden">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold select-none">
                {profile ? getInitials(profile.name) : "U"}
              </div>
              <button 
                className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow border border-gray-200 active:scale-95 transition-transform touch-manipulation"
                aria-label="Change profile picture"
              >
                <Camera className="w-3 h-3 text-gray-600" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{profile?.name}</h2>
              <div className="flex flex-wrap items-center gap-1 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  profile?.role === 'owner' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {profile?.role === 'owner' ? 'Owner' : 'Customer'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  profile?.emailVerified 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {profile?.emailVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {(success || error) && (
          <div className={`mb-4 lg:mb-6 p-4 rounded-xl shadow-sm ${
            success ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-800' :
            'bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {success ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
              <span className="font-medium text-sm lg:text-base">{success || error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Left Column - Profile Form */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-lg lg:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <User className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 flex-shrink-0" />
                  Personal Information
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4 lg:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={profile?.name || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 lg:px-4 py-2.5 lg:py-3 pl-10 lg:pl-11 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 bg-white text-base lg:text-lg touch-manipulation"
                        required
                        minLength={2}
                      />
                      <User className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={profile?.email || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 lg:px-4 py-2.5 lg:py-3 pl-10 lg:pl-11 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 bg-white text-base lg:text-lg touch-manipulation"
                        required
                      />
                      <Mail className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                      <div className="flex">
                        <span className="px-3 py-2.5 lg:py-3 border border-r-0 border-gray-300 rounded-l-lg lg:rounded-l-xl bg-gray-50 text-gray-700 font-medium text-sm lg:text-base">
                          +91
                        </span>
                        <input
                          type="tel"
                          name="phone"
                          value={profile?.phone || ""}
                          onChange={handleInputChange}
                          className="flex-1 px-3 lg:px-4 py-2.5 lg:py-3 border border-gray-300 rounded-r-lg lg:rounded-r-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 bg-white text-base lg:text-lg touch-manipulation"
                          placeholder="98765 43210"
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Account Type
                    </label>
                    <div className="px-3 lg:px-4 py-2.5 lg:py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg lg:rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2">
                        {profile?.role === "owner" ? (
                          <>
                            <Store className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600 flex-shrink-0" />
                            <span className="font-medium text-gray-900 text-sm lg:text-base">Store Owner</span>
                          </>
                        ) : (
                          <>
                            <User className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 flex-shrink-0" />
                            <span className="font-medium text-gray-900 text-sm lg:text-base">Customer</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 lg:mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Complete Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 lg:left-4 top-3 lg:top-4 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                    <textarea
                      name="address"
                      value={profile?.address || ""}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 lg:px-4 py-2.5 lg:py-3 pl-10 lg:pl-11 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 bg-white resize-none text-base lg:text-lg touch-manipulation"
                      placeholder="House No., Street, City, State, Pincode"
                    />
                  </div>
                </div>

                {/* Store Information (only for owners) */}
                {profile?.role === "owner" && (
                  <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-gray-200">
                    <h3 className="text-base lg:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Store className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600 flex-shrink-0" />
                      Store Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Store Name
                        </label>
                        <input
                          type="text"
                          name="storeName"
                          value={profile?.storeName || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 lg:px-4 py-2.5 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 bg-white text-base lg:text-lg touch-manipulation"
                          placeholder="Your store name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Store Type
                        </label>
                        <div className="relative">
                          <Store className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                          <select
                            name="storeType"
                            value={profile?.storeType || "kirana"}
                            onChange={(e) => profile && setProfile({...profile, storeType: e.target.value})}
                            className="w-full px-3 lg:px-4 py-2.5 lg:py-3 pl-10 lg:pl-11 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 bg-white appearance-none text-base lg:text-lg touch-manipulation"
                          >
                            <option value="kirana">Kirana Store</option>
                            <option value="supermarket">Supermarket</option>
                            <option value="convenience">Convenience Store</option>
                            <option value="specialty">Specialty Store</option>
                            <option value="other">Other</option>
                          </select>
                          <div className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleBackClick}
                    className="w-full sm:w-auto px-4 lg:px-6 py-2.5 lg:py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg lg:rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all touch-manipulation text-sm lg:text-base"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg lg:rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation text-sm lg:text-base"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 flex-shrink-0" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Update Card */}
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-lg lg:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Key className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 flex-shrink-0" />
                  Change Password
                </h2>
              </div>
              
              <form onSubmit={handlePasswordChange} className="p-4 lg:p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange}
                        className="w-full px-3 lg:px-4 py-2.5 lg:py-3 pl-10 lg:pl-11 pr-10 lg:pr-11 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 bg-white text-base lg:text-lg touch-manipulation"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 active:scale-95 touch-manipulation"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? 
                          <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : 
                          <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
                        }
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-3 lg:px-4 py-2.5 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 bg-white text-base lg:text-lg touch-manipulation"
                      required
                      minLength={8}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-3 lg:px-4 py-2.5 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 bg-white text-base lg:text-lg touch-manipulation"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="w-full sm:w-auto px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg lg:rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation text-sm lg:text-base"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 flex-shrink-0" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Account Status & Info */}
          <div className="space-y-4 lg:space-y-6">
            {/* Account Status Card */}
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-lg lg:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Globe className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 flex-shrink-0" />
                  Account Status
                </h2>
              </div>
              
              <div className="p-4 lg:p-6">
                <div className="space-y-4">
                  <div className="p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg lg:rounded-xl border border-gray-200">
                    <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">Account Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full ${profile?.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                      <span className="font-bold text-gray-900 text-sm lg:text-base">
                        {profile?.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg lg:rounded-xl border border-gray-200">
                    <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">Member Since</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 lg:w-4 lg:h-4 text-blue-600 flex-shrink-0" />
                      <span className="font-bold text-gray-900 text-sm lg:text-base">
                        {profile ? new Date(profile.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg lg:rounded-xl border border-gray-200">
                    <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">Email Verification</p>
                    <div className="flex items-center gap-2">
                      {profile?.emailVerified ? (
                        <>
                          <CheckCircle className="w-4 h-4 lg:w-4 lg:h-4 text-green-600 flex-shrink-0" />
                          <span className="font-bold text-green-700 text-sm lg:text-base">Verified</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 lg:w-4 lg:h-4 text-yellow-600 flex-shrink-0" />
                          <span className="font-bold text-yellow-700 text-sm lg:text-base">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-200">
                  <h3 className="text-xs lg:text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
                  <div className="space-y-2 lg:space-y-3">
                    <button className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg lg:rounded-xl transition-colors active:scale-[0.98] touch-manipulation group">
                      <span className="text-xs lg:text-sm font-medium text-blue-700">Verify Email</span>
                      <Edit className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg lg:rounded-xl transition-colors active:scale-[0.98] touch-manipulation group">
                      <span className="text-xs lg:text-sm font-medium text-emerald-700">Download Data</span>
                      <Edit className="w-3 h-3 lg:w-4 lg:h-4 text-emerald-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg lg:rounded-xl transition-colors active:scale-[0.98] touch-manipulation group">
                      <span className="text-xs lg:text-sm font-medium text-red-700">Delete Account</span>
                      <Edit className="w-3 h-3 lg:w-4 lg:h-4 text-red-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl lg:rounded-2xl border border-blue-200 p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-bold text-gray-800 mb-3">Profile Tips</h3>
              <ul className="space-y-2 lg:space-y-3">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-blue-600 rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></div>
                  <span className="text-xs lg:text-sm text-gray-700">Keep your contact information up to date</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-blue-600 rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></div>
                  <span className="text-xs lg:text-sm text-gray-700">Use a strong password with 8+ characters</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-blue-600 rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></div>
                  <span className="text-xs lg:text-sm text-gray-700">Verify your email for enhanced security</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-blue-600 rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></div>
                  <span className="text-xs lg:text-sm text-gray-700">Complete address ensures smooth deliveries</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}