"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { 
  Menu, 
  X, 
  Store, 
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  HelpCircle,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Home,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  Shield,
  Store as ShopIcon,
  Bell,
  Search,
  MessageSquare
} from "lucide-react";

// TypeScript interfaces
interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'order' | 'alert' | 'system' | 'promotion';
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

interface UserType {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'user';
  storeName?: string;
  avatar?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  allowedRoles: ('owner' | 'user')[];
  badge?: number;
  requiresStore?: boolean;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  
  const router = useRouter();
  const pathname = usePathname();
  
  // Get user data from hook
  const { user, isLoading: userLoading, error, refreshUser } = useUser();

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Close mobile menu on tablet+ screens
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
      // Close dropdowns on smaller screens for better UX
      if (window.innerWidth < 1024) {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    
    setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
      if (!target.closest('.notifications-dropdown')) {
        setIsNotificationsOpen(false);
      }
      if (!target.closest('.search-container')) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Fetch user data
  useEffect(() => {
    if (!userLoading && user) {
      fetchNotifications();
      fetchCartCount();
    }
  }, [user, userLoading]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const fetchCartCount = async () => {
    try {
      if (user?.role === 'user') {
        const response = await axios.get('/api/cart/count');
        setCartCount(response.data.count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
    }
  };

  const handleLogOut = async () => {
    try {
      setLoading(true);
      await axios.post("/api/auth/logout");
      
      // Clear all auth-related data
      localStorage.removeItem("user");
      sessionStorage.clear();
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Close dropdowns
      setIsProfileOpen(false);
      setIsMenuOpen(false);
      
      // Redirect to login page
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Optimistically update UI
      setNotifications(prev => prev.filter(n => n._id !== notification._id));
      
      // Mark as read in backend
      await axios.patch(`/api/notifications/${notification._id}`, { read: true });
      
      // Navigate if there's a link
      if (notification.metadata?.link) {
        router.push(notification.metadata.link);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Re-fetch notifications on error
      fetchNotifications();
    }
  };

  const clearAllNotifications = async () => {
    try {
      await axios.delete('/api/notifications');
      setNotifications([]);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Responsive navigation items - Different layouts for different screen sizes
  const navigationItems: NavItem[] = useMemo(() => [
    { 
      name: "Dashboard", 
      href: "/dashboard", 
      icon: <Home className="w-4 h-4 md:w-5 md:h-5" />,
      allowedRoles: ['owner', 'user']
    },
    { 
      name: "Orders", 
      href: "/orders", 
      icon: <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />,
      allowedRoles: ['owner', 'user'],
      badge: notifications.filter(n => n.type === 'order' && !n.read).length
    },
    // Owner-specific menu items
    { 
      name: "Products", 
      href: "/products", 
      icon: <Package className="w-4 h-4 md:w-5 md:h-5" />,
      allowedRoles: ['owner'],
      requiresStore: true
    },
    { 
      name: "Customers", 
      href: "/customers", 
      icon: <Users className="w-4 h-4 md:w-5 md:h-5" />,
      allowedRoles: ['owner'],
      requiresStore: true
    },
    // User-specific menu items
    { 
      name: "Shop", 
      href: "/shop", 
      icon: <ShopIcon className="w-4 h-4 md:w-5 md:h-5" />,
      allowedRoles: ['user']
    },
    { 
      name: "My Cart", 
      href: "/cart", 
      icon: <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />,
      allowedRoles: ['user']
    },
    // Common menu items
    { 
      name: "My Profile", 
      href: "/profile", 
      icon: <User className="w-4 h-4 md:w-5 md:h-5" />,
      allowedRoles: ['owner', 'user']
    },
  ], [notifications]);

  // Filter navigation items based on user role and store requirements
  const filteredNavItems = useMemo(() => {
    return navigationItems.filter(item => {
      const hasRole = item.allowedRoles.includes(user?.role || 'user');
      // For owner, check if store exists if required
      const hasStore = !item.requiresStore || (user?.role === 'owner' && user?.storeName);
      return hasRole && hasStore;
    });
  }, [navigationItems, user]);

  // Separate items for different screen sizes
  const desktopNavItems = useMemo(() => 
    filteredNavItems.filter(item => !['My Cart', 'My Profile'].includes(item.name))
  , [filteredNavItems]);

  const tabletNavItems = useMemo(() => 
    filteredNavItems.filter(item => 
      ['Dashboard', 'Orders', 'Shop', 'Products'].includes(item.name) ||
      (user?.role === 'owner' && ['Customers'].includes(item.name))
    )
  , [filteredNavItems, user]);

  // Get user initials for avatar
  const getUserInitials = useCallback(() => {
    if (!user?.name) return "U";
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [user]);

  // Get current active page
  const isActive = useCallback((href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  }, [pathname]);

  // Show loading state
  if (userLoading) {
    return (
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-sm' 
          : 'bg-white dark:bg-gray-900'
      } border-b border-gray-100 dark:border-gray-800`}>
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-10 rounded-xl"></div>
              <div className="hidden sm:block">
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-32 rounded mb-1"></div>
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-24 rounded-xl"></div>
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-10 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-sm' 
        : 'bg-white dark:bg-gray-900'
    } border-b border-gray-100 dark:border-gray-800`}>
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl lg:hidden transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            
            <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-sm">
                <Store className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="hidden xs:block">
                <h1 className="font-bold text-gray-800 dark:text-white text-lg sm:text-xl">
                  Kirana<span className="text-emerald-600 dark:text-emerald-400">Pro</span>
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  {user?.storeName || (user?.role === 'owner' ? 'Store Management' : 'Shopping Portal')}
                </p>
              </div>
            </Link>
          </div>

          {/* Search Bar - Visible on Tablet and Desktop */}
          {/* <div className="hidden md:flex flex-1 max-w-2xl mx-4 search-container">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products, orders, customers..."
                className="w-full px-4 pl-12 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                Search
              </button>
            </div>
          </div> */}

          {/* Desktop Navigation - Hidden on Mobile */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {desktopNavItems.slice(0, windowWidth >= 1280 ? 6 : 5).map((item) => (
              <Link 
                key={item.name}
                href={item.href} 
                className={`flex items-center gap-2 px-3 py-2 xl:px-4 xl:py-2 rounded-xl transition-all ${
                  isActive(item.href) 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.icon}
                <span className="text-sm xl:text-base">{item.name}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Tablet Navigation - Compact */}
          <div className="hidden md:flex lg:hidden items-center gap-1">
            {tabletNavItems.slice(0, 4).map((item) => (
              <Link 
                key={item.name}
                href={item.href} 
                className={`p-2 rounded-xl transition-all ${
                  isActive(item.href) 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                aria-label={item.name}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Button */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Cart Icon with Count - Only for users */}
            {user?.role === 'user' && (
              <Link 
                href="/cart" 
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                aria-label={`Shopping cart with ${cartCount} items`}
              >
                <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            )}
           

            {/* Notifications Dropdown */}
            <div className="relative notifications-dropdown">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                aria-label={`Notifications ${notifications.length > 0 ? `with ${notifications.length} unread` : ''}`}
                aria-expanded={isNotificationsOpen}
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length > 9 ? '9+' : notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                    <div className="flex gap-2">
                      {notifications.length > 0 && (
                        <>
                          <button 
                            onClick={markAllAsRead}
                            className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                          >
                            Mark all read
                          </button>
                          <button 
                            onClick={clearAllNotifications}
                            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            Clear All
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 20).map((notification) => (
                        <button
                          key={notification._id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0 ${
                            !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg mt-1 flex-shrink-0 ${
                              notification.type === 'order' ? 'bg-emerald-100 dark:bg-emerald-900' :
                              notification.type === 'alert' ? 'bg-red-100 dark:bg-red-900' :
                              notification.type === 'promotion' ? 'bg-purple-100 dark:bg-purple-900' :
                              'bg-blue-100 dark:bg-blue-900'
                            }`}>
                              {notification.type === 'order' ? <ShoppingBag className="w-4 h-4" /> :
                               notification.type === 'alert' ? <Package className="w-4 h-4" /> :
                               notification.type === 'promotion' ? <ShoppingBag className="w-4 h-4" /> :
                               <Bell className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                {new Date(notification.createdAt).toLocaleDateString()} • 
                                {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4  py-8 text-center">
                        <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          You're all caught up!
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
                      <Link 
                        href="/notifications" 
                        className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium text-center block"
                        onClick={() => setIsNotificationsOpen(false)}
                      >
                        View all notifications
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme Toggle - Always visible */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Help - Desktop only */}
           

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative profile-dropdown">
                <button 
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  aria-label="User profile menu"
                  aria-expanded={isProfileOpen}
                >
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-sm ${
                    user.role === 'owner' 
                      ? 'bg-gradient-to-br from-emerald-400 to-green-500' 
                      : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                  }`}>
                    <span className="text-white font-semibold text-sm">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="hidden xl:block text-left max-w-[150px]">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {user.name || user.storeName || 'User'}
                    </p>
                    <div className="flex items-center gap-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.role === 'owner' ? 'Store Owner' : 'Customer'}
                      </p>
                      {user.role === 'owner' && (
                        <Shield className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
                    isProfileOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <p className="font-medium text-gray-800 dark:text-white truncate">
                        {user.name || user.storeName || 'User'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.role === 'owner' 
                            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        }`}>
                          {user.role === 'owner' ? 'Store Owner' : 'Customer'}
                        </span>
                        {user.storeName && (
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full truncate max-w-[120px]">
                            {user.storeName}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <Link 
                        href="/profile" 
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        <span className="text-gray-700 dark:text-gray-200">My Profile</span>
                      </Link>
                      
                      {user.role === 'owner' && (
                        <Link 
                          href="/settings" 
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          <span className="text-gray-700 dark:text-gray-200">
                            Store Settings
                          </span>
                        </Link>
                      )}
                      
                      <div className="border-t border-gray-100 dark:border-gray-800 my-2"></div>
                      
                      <button
                        onClick={handleLogOut}
                        disabled={loading}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-red-600 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-busy={loading}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{loading ? 'Logging out...' : 'Logout'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-medium px-3 sm:px-4 py-2 rounded-xl transition-colors shadow-sm">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="mt-3 md:hidden search-container animate-in slide-in-from-top-4 duration-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products, orders, customers..."
                className="w-full px-4 pl-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent"
                autoFocus
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                Search
              </button>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-4 lg:hidden bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-lg animate-in slide-in-from-top-4 duration-200">
            <div className="space-y-1">
              <div className="px-2 pb-2 mb-2 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Navigation</p>
              </div>
              
              {filteredNavItems.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${
                    isActive(item.href) 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
          
              
              {user ? (
                <>
                  <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-4">
                    <div className="px-4 py-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Signed in as</p>
                      <p className="font-medium text-gray-800 dark:text-white truncate">
                        {user.name || user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.role === 'owner' 
                            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        }`}>
                          {user.role === 'owner' ? 'Store Owner' : 'Customer'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogOut();
                      setIsMenuOpen(false);
                    }}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    aria-busy={loading}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">{loading ? 'Logging out...' : 'Logout'}</span>
                  </button>
                </>
              ) : (
                <Link 
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-center font-medium rounded-lg transition-colors shadow-sm mt-4"
                >
                  Login to Account
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}