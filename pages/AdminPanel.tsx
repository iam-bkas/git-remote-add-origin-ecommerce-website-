
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Navigate, Link } from 'react-router-dom';
import { 
    LayoutDashboard, Package, ShoppingCart, Plus, Edit2, Trash2, 
    Sparkles, X, Search, DollarSign, Users, Loader2, Shield,
    AlertCircle, FileText, RotateCcw, TrendingUp, CheckCircle
} from 'lucide-react';
import { Category, Product, Role, User, OrderStatus } from '../types';
import { generateProductDescription } from '../services/gemini';

const AdminPanel = () => {
  const { 
    user, products, orders, allUsers, 
    addProduct, updateProduct, deleteProduct, updateOrderStatus, refundOrder,
    addUser, updateUser, deleteUser
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'users'>('dashboard');
  
  // Selection State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Search/Filter State
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  // --- Stats Calculation ---
  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;

  // Inventory Alerts
  const lowStockProducts = products.filter(p => p.stock <= 5);

  // Sales Report Mock Data Calculation
  const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { weekday: 'short' });
  });
  // Generate pseudo-random sales data for visuals
  const salesData = last7Days.map(() => Math.floor(Math.random() * 2000) + 500);
  const maxSale = Math.max(...salesData);

  // --- Filtering ---
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  const filteredOrders = orderStatusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === orderStatusFilter);

  // --- Bulk Action Handlers: Products ---
  const toggleProductSelect = (id: string) => {
    setSelectedProductIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAllProducts = () => {
    const allFilteredIds = filteredProducts.map(p => p.id);
    const areAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedProductIds.includes(id));
    
    if (areAllSelected) {
        // Deselect all visible
        setSelectedProductIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
        // Select all visible
        setSelectedProductIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleBulkDeleteProducts = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedProductIds.length} products?`)) {
        selectedProductIds.forEach(id => deleteProduct(id));
        setSelectedProductIds([]);
    }
  };

  // --- Bulk Action Handlers: Users ---
  const toggleUserSelect = (id: string) => {
    // Prevent selecting self
    if (id === user.id) return;
    setSelectedUserIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAllUsers = () => {
    // Select all except current user
    const selectableUsers = allUsers.filter(u => u.id !== user.id);
    if (selectedUserIds.length === selectableUsers.length) {
        setSelectedUserIds([]);
    } else {
        setSelectedUserIds(selectableUsers.map(u => u.id));
    }
  };

  const handleBulkDeleteUsers = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedUserIds.length} users?`)) {
        selectedUserIds.forEach(id => deleteUser(id));
        setSelectedUserIds([]);
    }
  };

  const handleBulkRoleChange = (newRole: Role) => {
    if (window.confirm(`Change role to ${newRole} for ${selectedUserIds.length} users?`)) {
        selectedUserIds.forEach(id => {
            const userToUpdate = allUsers.find(u => u.id === id);
            if (userToUpdate) {
                updateUser({ ...userToUpdate, role: newRole });
            }
        });
        setSelectedUserIds([]);
    }
  };

  const handleRefund = (orderId: string) => {
    if (window.confirm('Are you sure you want to refund this order? This will cancel the order and mark payment as refunded.')) {
        refundOrder(orderId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 pt-20 pb-4 flex flex-col z-0">
            <div className="px-6 mb-8">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Main Menu</h2>
            </div>
            <nav className="space-y-1 px-4 flex-1">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === 'dashboard' 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('products')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === 'products' 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <Package className="h-5 w-5" />
                    Products
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === 'orders' 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <ShoppingCart className="h-5 w-5" />
                    Orders
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === 'users' 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <Users className="h-5 w-5" />
                    Users
                </button>
            </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8 pt-24">
            {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-fade-in-up">
                    <h1 className="text-2xl font-serif font-bold text-gray-900">Dashboard Overview</h1>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                    <DollarSign className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-1">${totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                    <ShoppingCart className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">+5%</span>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{totalOrders}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                                    <Package className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-medium text-gray-500">Active</span>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">Products</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{products.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                                    <Users className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">+2</span>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">Users</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{allUsers.length}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Sales Chart */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                             <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900">Sales Report (Last 7 Days)</h3>
                                <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                                    <TrendingUp className="h-4 w-4" />
                                    +12.5%
                                </div>
                             </div>
                             <div className="h-64 flex items-end gap-4">
                                 {salesData.map((val, idx) => (
                                     <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                         <div 
                                            className="w-full bg-indigo-100 rounded-t-lg transition-all duration-500 hover:bg-indigo-600 relative" 
                                            style={{ height: `${(val / maxSale) * 100}%` }}
                                         >
                                             {/* Tooltip */}
                                             <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                 ${val}
                                             </div>
                                         </div>
                                         <span className="text-xs text-gray-500">{last7Days[idx]}</span>
                                     </div>
                                 ))}
                             </div>
                        </div>

                        {/* Inventory Alerts */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-orange-500" />
                                Low Stock Alerts
                            </h3>
                            {lowStockProducts.length > 0 ? (
                                <div className="space-y-4">
                                    {lowStockProducts.map(p => (
                                        <div key={p.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                                            <img src={p.image} className="h-10 w-10 rounded-md object-cover" alt="" />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-gray-900 truncate">{p.name}</h4>
                                                <p className="text-xs text-orange-700 font-medium">Only {p.stock} left</p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setEditingProduct(p);
                                                    setIsProductModalOpen(true);
                                                }}
                                                className="p-1.5 bg-white text-orange-600 rounded-md shadow-sm text-xs font-bold border border-orange-200 hover:bg-orange-100"
                                            >
                                                Restock
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                                    <p>Inventory levels are healthy.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'products' && (
                <div className="space-y-6 animate-fade-in-up">
                    {/* Header / Bulk Actions */}
                    {selectedProductIds.length > 0 ? (
                        <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm animate-fade-in">
                            <div className="flex items-center gap-3">
                                <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                                    {selectedProductIds.length}
                                </span>
                                <span className="text-indigo-900 font-medium">Selected</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setSelectedProductIds([])}
                                    className="px-4 py-2 text-sm text-indigo-700 font-medium hover:bg-indigo-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleBulkDeleteProducts}
                                    className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 shadow-sm flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" /> Delete Selected
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center p-2 gap-4">
                            <h1 className="text-2xl font-serif font-bold text-gray-900">Product Management</h1>
                            <div className="flex gap-4 items-center">
                                {/* Search Bar */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input 
                                        type="text"
                                        placeholder="Search products..."
                                        value={productSearchQuery}
                                        onChange={(e) => setProductSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    {productSearchQuery && (
                                        <button 
                                            onClick={() => setProductSearchQuery('')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                                <button 
                                    onClick={() => {
                                        setEditingProduct(null);
                                        setIsProductModalOpen(true);
                                    }}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 whitespace-nowrap"
                                >
                                    <Plus className="h-5 w-5" /> Add Product
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-sm">
                                <tr>
                                    <th className="px-6 py-4 w-12">
                                        <input 
                                            type="checkbox" 
                                            checked={filteredProducts.length > 0 && filteredProducts.every(p => selectedProductIds.includes(p.id))}
                                            onChange={toggleAllProducts}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-6 py-4 font-medium">Product</th>
                                    <th className="px-6 py-4 font-medium">Category</th>
                                    <th className="px-6 py-4 font-medium">Stock</th>
                                    <th className="px-6 py-4 font-medium">Price</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${selectedProductIds.includes(product.id) ? 'bg-indigo-50/30' : ''}`}>
                                            <td className="px-6 py-4">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedProductIds.includes(product.id)}
                                                    onChange={() => toggleProductSelect(product.id)}
                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <img src={product.image} alt="" className="h-10 w-10 rounded-lg object-cover bg-gray-100" />
                                                    <span className="font-medium text-gray-900">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{product.category}</td>
                                            <td className="px-6 py-4">
                                                {product.stock === 0 ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                                        <AlertCircle className="h-3 w-3" /> Out of Stock
                                                    </span>
                                                ) : product.stock < 10 ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                                        Low: {product.stock}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-600 font-medium">{product.stock}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">${product.price.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => {
                                                            setEditingProduct(product);
                                                            setIsProductModalOpen(true);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteProduct(product.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No products found matching "{productSearchQuery}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <h1 className="text-2xl font-serif font-bold text-gray-900">Order Management</h1>
                        
                        {/* Status Filters */}
                        <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setOrderStatusFilter(status as OrderStatus | 'all')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-colors ${
                                        orderStatusFilter === status 
                                        ? 'bg-indigo-600 text-white shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-sm">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Order ID</th>
                                    <th className="px-6 py-4 font-medium">Customer</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Payment</th>
                                    <th className="px-6 py-4 font-medium text-right">Total</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-indigo-600">
                                                <Link to={`/order/${order.id}`} className="hover:underline">#{order.id}</Link>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">{order.customerName}</td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">{new Date(order.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <select 
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                                    disabled={order.status === 'cancelled'}
                                                    className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-md border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer
                                                        ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' : 
                                                        order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700 opacity-75' :
                                                        'bg-yellow-100 text-yellow-700'
                                                        }`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                                                    ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                                                      order.paymentStatus === 'refunded' ? 'bg-gray-200 text-gray-800' : 
                                                      order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                                                      'bg-yellow-100 text-yellow-800'}
                                                `}>
                                                    {order.paymentStatus}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900">${order.total.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {order.paymentStatus === 'paid' && order.status !== 'cancelled' && (
                                                        <button 
                                                            onClick={() => handleRefund(order.id)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-1 text-xs font-medium transition-colors"
                                                            title="Process Refund"
                                                        >
                                                            <RotateCcw className="h-4 w-4" /> Refund
                                                        </button>
                                                    )}
                                                    <Link 
                                                        to={`/order/${order.id}/invoice`}
                                                        className="inline-flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                                                        title="View Invoice"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            No orders found for this status.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="space-y-6 animate-fade-in-up">
                    {/* Header / Bulk Actions */}
                    {selectedUserIds.length > 0 ? (
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm animate-fade-in gap-4">
                            <div className="flex items-center gap-3">
                                <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                                    {selectedUserIds.length}
                                </span>
                                <span className="text-indigo-900 font-medium">Users Selected</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button 
                                    onClick={() => handleBulkRoleChange('admin')}
                                    className="px-3 py-2 bg-white text-indigo-700 border border-indigo-200 text-sm font-medium rounded-lg hover:bg-indigo-100 flex items-center gap-1"
                                >
                                    <Shield className="h-4 w-4" /> Make Admin
                                </button>
                                <button 
                                    onClick={() => handleBulkRoleChange('user')}
                                    className="px-3 py-2 bg-white text-gray-700 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-100 flex items-center gap-1"
                                >
                                    <Users className="h-4 w-4" /> Make User
                                </button>
                                <div className="w-px h-6 bg-indigo-200 mx-1"></div>
                                <button 
                                    onClick={handleBulkDeleteUsers}
                                    className="px-3 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 shadow-sm flex items-center gap-1"
                                >
                                    <Trash2 className="h-4 w-4" /> Delete
                                </button>
                                <button 
                                    onClick={() => setSelectedUserIds([])}
                                    className="ml-2 p-2 text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100 rounded-lg"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center p-2">
                            <h1 className="text-2xl font-serif font-bold text-gray-900">User Management</h1>
                            <button 
                                onClick={() => {
                                    setEditingUser(null);
                                    setIsUserModalOpen(true);
                                }}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
                            >
                                <Plus className="h-5 w-5" /> Add User
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-sm">
                                <tr>
                                    <th className="px-6 py-4 w-12">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedUserIds.length === (allUsers.length - 1) && allUsers.length > 1}
                                            onChange={toggleAllUsers}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-6 py-4 font-medium">User</th>
                                    <th className="px-6 py-4 font-medium">Role</th>
                                    <th className="px-6 py-4 font-medium">User ID</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {allUsers.map((u) => {
                                    const isSelf = u.id === user.id;
                                    return (
                                        <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${selectedUserIds.includes(u.id) ? 'bg-indigo-50/30' : ''}`}>
                                            <td className="px-6 py-4">
                                                {!isSelf && (
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedUserIds.includes(u.id)}
                                                        onChange={() => toggleUserSelect(u.id)}
                                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <img src={u.avatar} alt="" className="h-10 w-10 rounded-full bg-gray-100" />
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {u.name} {isSelf && <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">You</span>}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    u.role === 'admin' 
                                                    ? 'bg-purple-100 text-purple-800' 
                                                    : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {u.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                                                    {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm font-mono">{u.id}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => {
                                                            setEditingUser(u);
                                                            setIsUserModalOpen(true);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteUser(u.id)}
                                                        disabled={isSelf}
                                                        className={`p-2 rounded-lg ${
                                                            isSelf 
                                                            ? 'text-gray-200 cursor-not-allowed' 
                                                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                                        }`}
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>

        {/* Product Modal */}
        {isProductModalOpen && (
            <ProductFormModal 
                product={editingProduct} 
                onClose={() => setIsProductModalOpen(false)}
                onSave={(p) => {
                    if (editingProduct) updateProduct(p);
                    else addProduct(p);
                    setIsProductModalOpen(false);
                }}
            />
        )}

        {/* User Modal */}
        {isUserModalOpen && (
            <UserFormModal
                user={editingUser}
                onClose={() => setIsUserModalOpen(false)}
                onSave={(u) => {
                    if (editingUser) updateUser(u);
                    else addUser(u);
                    setIsUserModalOpen(false);
                }}
            />
        )}
    </div>
  );
};

// Sub-component for Product Form with AI
const ProductFormModal = ({ product, onClose, onSave }: { product: Product | null, onClose: () => void, onSave: (p: Product) => void }) => {
    const [formData, setFormData] = useState<Partial<Product>>(product || {
        name: '',
        price: 0,
        category: Category.Clothing,
        description: '',
        image: 'https://picsum.photos/800/800', // Default placeholder
        rating: 5.0,
        reviews: 0,
        features: [],
        stock: 20
    });
    const [isGenerating, setIsGenerating] = useState(false);
    // Initialize feature input with existing features if editing
    const [featureInput, setFeatureInput] = useState(product && product.features ? product.features.join(', ') : '');

    const handleGenerateDesc = async () => {
        if (!formData.name || !formData.category) return;
        setIsGenerating(true);
        const desc = await generateProductDescription(formData.name, formData.category, featureInput);
        setFormData(prev => ({ ...prev, description: desc }));
        setIsGenerating(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h3 className="text-xl font-serif font-bold text-gray-900">
                        {product ? 'Edit Product' : 'New Product'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                                placeholder="e.g. Silk Scarf"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select 
                                value={formData.category} 
                                onChange={e => setFormData({...formData, category: e.target.value as Category})}
                                className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                            >
                                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                            <input 
                                type="number"
                                value={formData.price} 
                                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                                className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                            <input 
                                type="number"
                                value={formData.stock} 
                                onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                                className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                             <input 
                                value={formData.image} 
                                onChange={e => setFormData({...formData, image: e.target.value})}
                                className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <button 
                                onClick={handleGenerateDesc}
                                disabled={isGenerating || !formData.name}
                                className="text-xs flex items-center gap-1 text-indigo-600 font-bold hover:text-indigo-700 disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                Generate with AI
                            </button>
                        </div>
                        <textarea 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            rows={4}
                            className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-3 border"
                            placeholder="Product description..."
                        />
                    </div>
                    
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Key Features (comma separated for auto-fill)</label>
                         <input 
                             value={featureInput}
                             onChange={e => {
                                 setFeatureInput(e.target.value);
                                 setFormData({...formData, features: e.target.value.split(',').map(s => s.trim()).filter(Boolean)});
                             }}
                             placeholder="e.g. Waterproof, Lightweight, Durable"
                             className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                         />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg">Cancel</button>
                    <button 
                        onClick={() => onSave({ ...formData, id: product?.id || Date.now().toString() } as Product)}
                        className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md"
                    >
                        Save Product
                    </button>
                </div>
            </div>
        </div>
    );
};

// Sub-component for User Form
const UserFormModal = ({ user, onClose, onSave }: { user: User | null, onClose: () => void, onSave: (u: User) => void }) => {
    const [formData, setFormData] = useState<Partial<User>>(user || {
        name: '',
        email: '',
        role: 'user',
        avatar: ''
    });

    const handleSubmit = () => {
        // Auto-generate avatar if missing
        const avatar = formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=random&color=fff`;
        
        onSave({ 
            ...formData, 
            avatar,
            id: user?.id || `user-${Date.now()}` 
        } as User);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-fade-in-up">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h3 className="text-xl font-serif font-bold text-gray-900">
                        {user ? 'Edit User' : 'New User'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                            placeholder="e.g. John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input 
                            type="email"
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                            placeholder="john@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select 
                            value={formData.role} 
                            onChange={e => setFormData({...formData, role: e.target.value as Role})}
                            className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg">Cancel</button>
                    <button 
                        onClick={handleSubmit}
                        disabled={!formData.name || !formData.email}
                        className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md disabled:opacity-50"
                    >
                        Save User
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
