
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Star, AlertCircle, Heart } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 transition-all hover:shadow-lg hover:border-gray-200 flex flex-col h-full">
      <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          className={`h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
          loading="lazy"
        />
        
        {/* Wishlist Button */}
        <button
            onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product.id);
            }}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 transition-all z-10"
        >
            <Heart className={`h-5 w-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
          {isOutOfStock && (
            <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-md">
              Out of Stock
            </span>
          )}
          {isLowStock && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              Low Stock
            </span>
          )}
        </div>

        {/* Quick Add Button */}
        {!isOutOfStock && (
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="absolute bottom-4 right-4 bg-white text-gray-900 p-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-indigo-600 hover:text-white"
            aria-label="Add to cart"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{product.category}</p>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-xs text-gray-600 font-medium">{product.rating}</span>
          </div>
        </div>
        <Link to={`/product/${product.id}`} className="block flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-end justify-between mt-2">
          <p className="text-gray-900 font-bold">${product.price.toFixed(2)}</p>
          {isOutOfStock && (
            <div className="text-xs text-red-500 font-medium flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Sold Out
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
