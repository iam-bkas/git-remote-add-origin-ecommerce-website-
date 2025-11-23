
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Sparkles, User as UserIcon, LayoutDashboard, Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Navbar = () => {
  const { cartCount, setIsCartOpen, user, logout } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Collections', path: '/shop?filter=collections' },
  ];

  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            <span className="font-serif text-2xl font-bold tracking-tight text-gray-900">Lumina</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
                  location.pathname === link.path ? 'text-indigo-600' : 'text-gray-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">
            
            {/* Search Bar */}
            <div className="hidden sm:flex items-center">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="relative flex items-center animate-fade-in">
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-48 lg:w-64 pl-4 pr-8 py-1.5 text-sm rounded-full border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <button 
                    type="button" 
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="text-gray-500 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>
            
            {/* Wishlist */}
            <Link 
              to={user ? "/wishlist" : "/login"}
              className="text-gray-500 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-gray-100 hidden sm:block"
            >
                <Heart className="h-5 w-5" />
            </Link>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative text-gray-500 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-indigo-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              {user ? (
                <div className="relative">
                   <button 
                     onClick={toggleProfileMenu}
                     className="flex items-center gap-2 focus:outline-none"
                   >
                     <img 
                       src={user.avatar} 
                       alt={user.name} 
                       className="h-8 w-8 rounded-full border border-gray-200"
                     />
                   </button>
                   
                   {isProfileMenuOpen && (
                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 overflow-hidden animate-fade-in-up">
                       <div className="px-4 py-2 border-b border-gray-100">
                         <p className="text-sm font-medium text-gray-900">{user.name}</p>
                         <p className="text-xs text-gray-500 truncate">{user.email}</p>
                       </div>
                       
                       {user.role === 'admin' ? (
                         <Link 
                            to="/admin" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileMenuOpen(false)}
                         >
                           Admin Dashboard
                         </Link>
                       ) : (
                          <Link 
                            to="/account" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                           My Account
                         </Link>
                       )}

                       <Link 
                            to="/wishlist" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileMenuOpen(false)}
                       >
                           My Wishlist
                       </Link>
                       
                       <button
                         onClick={() => {
                           logout();
                           setIsProfileMenuOpen(false);
                         }}
                         className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                       >
                         Sign out
                       </button>
                     </div>
                   )}
                </div>
              ) : (
                <Link to="/login" className="text-gray-500 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                  <UserIcon className="h-5 w-5" />
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500 p-2"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             {/* Mobile Search */}
            <form 
              onSubmit={(e) => {
                handleSearch(e);
                setIsMobileMenuOpen(false);
              }}
              className="px-3 pb-2"
            >
              <div className="relative">
                 <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </form>

            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
                to="/wishlist"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
            >
                Wishlist
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}
            {!user && (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
