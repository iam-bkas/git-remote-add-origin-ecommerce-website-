
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import ChatAssistant from './components/ChatAssistant';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import UserPanel from './pages/UserPanel';
import AdminPanel from './pages/AdminPanel';
import OrderDetail from './pages/OrderDetail';
import Invoice from './pages/Invoice';
import Wishlist from './pages/Wishlist';
import NotificationToast from './components/NotificationToast';
import { StoreProvider } from './context/StoreContext';

const Footer = () => (
  <footer className="bg-gray-900 text-white py-12 print:hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <h3 className="font-serif text-2xl font-bold mb-4">Lumina</h3>
        <p className="text-gray-400 text-sm">
          Redefining the shopping experience with artificial intelligence.
        </p>
      </div>
      <div>
        <h4 className="font-bold mb-4">Shop</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>All Products</li>
          <li>New Arrivals</li>
          <li>Best Sellers</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-4">Support</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>FAQ</li>
          <li>Shipping & Returns</li>
          <li>Contact Us</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-4">Newsletter</h4>
        <div className="flex">
          <input type="email" placeholder="Enter your email" className="bg-gray-800 text-white px-4 py-2 rounded-l-md w-full focus:outline-none" />
          <button className="bg-indigo-600 px-4 py-2 rounded-r-md hover:bg-indigo-700">Subscribe</button>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
      © 2024 Lumina AI Commerce. All rights reserved.
    </div>
  </footer>
);

function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen">
          <div className="print:hidden"><Navbar /></div>
          <CartDrawer />
          <div className="print:hidden"><ChatAssistant /></div>
          <NotificationToast />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/account" element={<UserPanel />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/order/:id" element={<OrderDetail />} />
              <Route path="/order/:id/invoice" element={<Invoice />} />
              <Route path="/wishlist" element={<Wishlist />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </StoreProvider>
  );
}

export default App;
