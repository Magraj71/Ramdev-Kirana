import Navbar from "@/components/Navbar"
import Link from "next/link";
import { 
  TrendingUp, 
  Package, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Activity,
  BarChart3,
  Bell,
  Search,
  Download,
  Filter,
  MoreVertical,
  ChevronRight,
  Calendar,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Store,
  CreditCard,
  Truck,
  Star
} from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <Navbar />
      
      <main className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Store Dashboard</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-sm text-gray-600">
                <Store className="w-4 h-4 mr-1" />
                <span>Ramdev Enterprises Store • Cherai, Jodhpur, Rajasthan</span>
              </div>
              <span className="hidden md:inline text-gray-400">•</span>
              <span className="text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full">
                <Activity className="w-3 h-3 inline mr-1" />
                Store Open
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search orders, products..." 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full md:w-64"
              />
            </div>
            <button className="p-2 hover:bg-white rounded-xl border border-gray-200 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-xl transition-colors">
              <Calendar className="w-4 h-4" />
              Today
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-6 shadow-sm border border-emerald-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">₹8,425</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +12.5% from yesterday
                  </span>
                </div>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-sm border border-blue-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">124</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    8 new today
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 shadow-sm border border-orange-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">256</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full flex items-center">
                    <Package className="w-3 h-3 mr-1" />
                    12 low stock
                  </span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-sm border border-purple-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">89</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    5 new this week
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Revenue Overview</h3>
                <p className="text-sm text-gray-600">Last 7 days performance</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <Filter className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Chart Placeholder */}
            <div className="h-64 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">Revenue chart visualization</p>
                <p className="text-sm text-gray-500 mt-1">(Chart library integration)</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <p className="text-sm text-gray-600">Daily Average</p>
                <p className="text-xl font-bold text-gray-800">₹7,250</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Weekly Growth</p>
                <p className="text-xl font-bold text-gray-800">+18.2%</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Best Day</p>
                <p className="text-xl font-bold text-gray-800">₹12,500</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Quick Insights</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Digital Payments</p>
                    <p className="text-sm text-gray-600">68% of total revenue</p>
                  </div>
                </div>
                <span className="text-emerald-600 font-bold">₹23,456</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Home Delivery</p>
                    <p className="text-sm text-gray-600">24 orders this week</p>
                  </div>
                </div>
                <span className="text-blue-600 font-bold">42%</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3">
                    <Star className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Top Product</p>
                    <p className="text-sm text-gray-600">Sugar (₹4,200 sales)</p>
                  </div>
                </div>
                <span className="text-orange-600 font-bold">85 units</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Repeat Customers</p>
                    <p className="text-sm text-gray-600">Customer loyalty</p>
                  </div>
                </div>
                <span className="text-purple-600 font-bold">72%</span>
              </div>
            </div>

            <button className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-3 rounded-xl transition-all">
              <RefreshCw className="w-4 h-4" />
              Generate Daily Report
            </button>
          </div>
        </div>

        {/* Recent Orders & Low Stock Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
                <Link href="/orders" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { id: "#ORD-7821", customer: "Rahul Sharma", amount: "₹1,250", status: "delivered", time: "10:30 AM" },
                  { id: "#ORD-7820", customer: "Priya Patel", amount: "₹850", status: "processing", time: "9:45 AM" },
                  { id: "#ORD-7819", customer: "Amit Kumar", amount: "₹2,100", status: "delivered", time: "Yesterday" },
                  { id: "#ORD-7818", customer: "Neha Gupta", amount: "₹560", status: "pending", time: "Yesterday" },
                  { id: "#ORD-7817", customer: "Sanjay Mehta", amount: "₹3,400", status: "delivered", time: "Dec 12" },
                ].map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                    <div>
                      <p className="font-medium text-gray-800">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{order.amount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-6 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-emerald-300 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 font-medium py-3 rounded-xl transition-all">
                <Plus className="w-5 h-5" />
                Create New Order
              </button>
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Low Stock Alert</h3>
                <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">12 items</span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { name: "Sugar (5kg)", stock: 8, min: 15, category: "Grocery" },
                  { name: "Refined Oil (1L)", stock: 5, min: 10, category: "Cooking" },
                  { name: "Dettol Soap", stock: 12, min: 25, category: "Personal Care" },
                  { name: "Maggi Noodles", stock: 15, min: 30, category: "Instant Food" },
                  { name: "Milk Powder", stock: 7, min: 20, category: "Dairy" },
                ].map((product) => (
                  <div key={product.name} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                    <div>
                      <p className="font-medium text-gray-800">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${product.stock < 10 ? 'text-red-600' : 'text-orange-600'}`}>
                        {product.stock} units
                      </p>
                      <p className="text-xs text-gray-500">Min: {product.min}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-3 rounded-xl transition-colors">
                  <Edit className="w-4 h-4" />
                  Update Stock
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium py-3 rounded-xl transition-colors">
                  <Package className="w-4 h-4" />
                  Order Supplies
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-xl p-4 flex flex-col items-center justify-center transition-all group">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
              <ShoppingBag className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="font-medium text-gray-700">New Sale</span>
          </button>
          
          <button className="bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl p-4 flex flex-col items-center justify-center transition-all group">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <span className="font-medium text-gray-700">Add Product</span>
          </button>
          
          <button className="bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 rounded-xl p-4 flex flex-col items-center justify-center transition-all group">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <span className="font-medium text-gray-700">Add Customer</span>
          </button>
          
          <button className="bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl p-4 flex flex-col items-center justify-center transition-all group">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <span className="font-medium text-gray-700">Reports</span>
          </button>
        </div>
      </main>
    </div>
  );
}