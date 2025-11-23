
import React from 'react';
import { useStore } from '../context/StoreContext';
import { Heart, ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Link, Navigate } from 'react-router-dom';

const Wishlist = () => {
  const { user, products } = useStore();

  if (!user) {
      return <Navigate to="/login" />;
  }

  const wishlistProducts = products.filter(p => user.wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
            <Heart className="h-8 w-8 text-indigo-600 fill-indigo-600" />
            <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900">My Wishlist</h1>
                <p className="text-gray-500">
                    {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved for later
                </p>
            </div>
        </div>

        {wishlistProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
                    <Heart className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                    Save items you love here to easily find them later.
                </p>
                <Link 
                    to="/shop" 
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-colors"
                >
                    Start Shopping <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
