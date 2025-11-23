
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Package, Calendar, MapPin, LogOut, Settings, Plus, Trash2, Edit2, User as UserIcon, Lock, ChevronRight } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { Address } from '../types';

const UserPanel = () => {
  const { user, orders, logout, addAddress, removeAddress, updateUser } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'settings'>('overview');
  
  // Address Form State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    isDefault: false
  });

  // Settings State
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  if (!user || user.role === 'guest') {
    return <Navigate to="/login" />;
  }

  const myOrders = orders.filter(o => o.userId === user.id);

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAddress.street && newAddress.city && newAddress.zip) {
        addAddress({
            ...newAddress,
            id: `addr-${Date.now()}`,
            label: newAddress.label || 'Home',
            street: newAddress.street!,
            city: newAddress.city!,
            state: newAddress.state || '',
            zip: newAddress.zip!,
            country: newAddress.country || 'USA',
            isDefault: newAddress.isDefault || false
        } as Address);
        setIsAddressModalOpen(false);
        setNewAddress({ label: 'Home', street: '', city: '', state: '', zip: '', country: '', isDefault: false });
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Password updated successfully! (Mock)");
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900">My Account</h1>
                <p className="text-gray-500 mt-1">Manage your orders and preferences</p>
            </div>
            <button 
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 self-start md:self-auto"
            >
                <LogOut className="h-4 w-4" />
                Sign Out
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                        <img src={user.avatar} alt="Profile" className="h-12 w-12 rounded-full border border-gray-200" />
                        <div className="overflow-hidden">
                            <h2 className="font-bold text-gray-900 truncate">{user.name}</h2>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <nav className="p-2 space-y-1">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <UserIcon className="h-5 w-5" />
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                activeTab === 'orders' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Package className="h-5 w-5" />
                            Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('addresses')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                activeTab === 'addresses' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <MapPin className="h-5 w-5" />
                            Addresses
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Settings className="h-5 w-5" />
                            Settings
                        </button>
                    </nav>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                                <h3 className="text-indigo-100 text-sm font-medium mb-1">Total Spent</h3>
                                <p className="text-3xl font-bold">
                                    ${myOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-gray-500 text-sm font-medium mb-1">Total Orders</h3>
                                <p className="text-3xl font-bold text-gray-900">{myOrders.length}</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-gray-500 text-sm font-medium mb-1">Saved Addresses</h3>
                                <p className="text-3xl font-bold text-gray-900">{user.addresses.length}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Recent Order</h3>
                            {myOrders.length > 0 ? (
                                <div className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
                                    <div>
                                        <p className="font-bold text-gray-900">#{myOrders[0].id}</p>
                                        <p className="text-sm text-gray-500">{new Date(myOrders[0].date).toLocaleDateString()} • {myOrders[0].items.length} items</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                                            ${myOrders[0].status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
                                        `}>
                                            {myOrders[0].status}
                                        </span>
                                        <Link to={`/order/${myOrders[0].id}`} className="text-indigo-600 font-medium text-sm hover:underline flex items-center gap-1">
                                            View Details <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No recent orders found.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-900">Order History</h3>
                        </div>
                        {myOrders.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {myOrders.map(order => (
                                    <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg font-bold text-sm">
                                                    #{order.id.slice(-6).toUpperCase()}
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(order.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                                ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                                  order.status === 'processing' ? 'bg-blue-100 text-blue-700' : 
                                                  order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                                  'bg-yellow-100 text-yellow-700'
                                                }
                                            `}>
                                                {order.status}
                                            </div>
                                        </div>

                                        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar mb-4">
                                            {order.items.map(item => (
                                                <div key={item.id} className="flex-shrink-0 relative group">
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.name} 
                                                        className="h-16 w-16 rounded-md object-cover border border-gray-200" 
                                                    />
                                                    <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                                                        {item.quantity}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                            <p className="text-lg font-bold text-gray-900">${order.total.toFixed(2)}</p>
                                            <Link 
                                                to={`/order/${order.id}`}
                                                className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                                            >
                                                Track Order
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                <p>No orders yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ADDRESSES TAB */}
                {activeTab === 'addresses' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-serif font-bold text-gray-900">Address Book</h2>
                            <button 
                                onClick={() => setIsAddressModalOpen(true)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" /> Add New
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {user.addresses.map(addr => (
                                <div key={addr.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative group">
                                    {addr.isDefault && (
                                        <span className="absolute top-4 right-4 bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                                            Default
                                        </span>
                                    )}
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <MapPin className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{addr.label}</h3>
                                            <p className="text-sm text-gray-500">{user.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1 mb-6">
                                        <p>{addr.street}</p>
                                        <p>{addr.city}, {addr.state} {addr.zip}</p>
                                        <p>{addr.country}</p>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => removeAddress(addr.id)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                                        >
                                            <Trash2 className="h-4 w-4" /> Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {user.addresses.length === 0 && (
                                <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                                    <p>No addresses saved yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Add Address Modal */}
                        {isAddressModalOpen && (
                             <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsAddressModalOpen(false)}></div>
                                <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in-up">
                                    <h3 className="text-xl font-bold mb-4">Add New Address</h3>
                                    <form onSubmit={handleAddAddress} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Label (e.g. Home)</label>
                                            <input 
                                                required
                                                value={newAddress.label}
                                                onChange={e => setNewAddress({...newAddress, label: e.target.value})}
                                                className="w-full rounded-lg border-gray-300 p-2 border"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                            <input 
                                                required
                                                value={newAddress.street}
                                                onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                                                className="w-full rounded-lg border-gray-300 p-2 border"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                                <input 
                                                    required
                                                    value={newAddress.city}
                                                    onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                                                    className="w-full rounded-lg border-gray-300 p-2 border"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                                <input 
                                                    value={newAddress.state}
                                                    onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                                                    className="w-full rounded-lg border-gray-300 p-2 border"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                                                <input 
                                                    required
                                                    value={newAddress.zip}
                                                    onChange={e => setNewAddress({...newAddress, zip: e.target.value})}
                                                    className="w-full rounded-lg border-gray-300 p-2 border"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                                <input 
                                                    value={newAddress.country}
                                                    onChange={e => setNewAddress({...newAddress, country: e.target.value})}
                                                    className="w-full rounded-lg border-gray-300 p-2 border"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="checkbox"
                                                id="defaultAddr"
                                                checked={newAddress.isDefault}
                                                onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label htmlFor="defaultAddr" className="text-sm text-gray-700">Set as default address</label>
                                        </div>
                                        <div className="pt-4 flex justify-end gap-3">
                                            <button type="button" onClick={() => setIsAddressModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Address</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="space-y-8 animate-fade-in-up">
                         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-indigo-600" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={user.name}
                                        onChange={(e) => updateUser({ ...user, name: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 p-2.5 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={user.email}
                                        disabled
                                        className="w-full rounded-lg border-gray-300 p-2.5 border bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                         </div>

                         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
                                <Lock className="h-5 w-5 text-indigo-600" />
                                Security
                            </h3>
                            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                    <input 
                                        type="password" 
                                        required
                                        value={passwordForm.current}
                                        onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                                        className="w-full rounded-lg border-gray-300 p-2.5 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input 
                                        type="password" 
                                        required
                                        value={passwordForm.new}
                                        onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                                        className="w-full rounded-lg border-gray-300 p-2.5 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        required
                                        value={passwordForm.confirm}
                                        onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                                        className="w-full rounded-lg border-gray-300 p-2.5 border"
                                    />
                                </div>
                                <div className="pt-2">
                                    <button type="submit" className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors">
                                        Update Password
                                    </button>
                                </div>
                            </form>
                         </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserPanel;
