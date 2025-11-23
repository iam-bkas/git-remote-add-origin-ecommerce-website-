import React, { useState, useMemo, useEffect } from 'react';
import { Filter, Search, ArrowUpDown, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { Category } from '../types';
import { useLocation } from 'react-router-dom';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating-desc';

const Shop = () => {
  const { products } = useStore();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') as Category | 'All';
  const initialSearch = queryParams.get('search') || '';

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>(initialCategory || 'All');
  const [priceRange, setPriceRange] = useState<number>(1000);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Sync state with URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category') as Category | 'All';
    const searchParam = params.get('search');

    if (categoryParam) setSelectedCategory(categoryParam);
    if (searchParam !== null) setSearchQuery(searchParam);
  }, [location.search]);

  const categories = ['All', ...Object.values(Category)];

  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesPrice = product.price <= priceRange;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesPrice && matchesSearch;
    });

    // Sort Logic
    switch (sortBy) {
        case 'price-asc':
            result.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            result.sort((a, b) => b.price - a.price);
            break;
        case 'rating-desc':
            result.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
        default:
            // Assuming default order in array is "newest" for mock
            break;
    }

    return result;
  }, [products, selectedCategory, priceRange, searchQuery, sortBy]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setPriceRange(1000);
    setSearchQuery('');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Shop All</h1>
          <p className="text-gray-500 mt-1">Discover our premium collection of {products.length} items.</p>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8 sticky top-20 z-10">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
             
             {/* Search */}
             <div className="relative w-full lg:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input 
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
             </div>

             {/* Filters & Sort */}
             <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto justify-end">
                
                {/* Category */}
                <div className="relative">
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as Category | 'All')}
                        className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <Filter className="h-3 w-3" />
                    </div>
                </div>

                {/* Sort */}
                <div className="relative">
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                    >
                        <option value="newest">Newest Arrivals</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating-desc">Top Rated</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <ArrowUpDown className="h-3 w-3" />
                    </div>
                </div>

                {/* Price Slider */}
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase">Max ${priceRange}</span>
                    <input 
                        type="range" 
                        min="0" 
                        max="1000" 
                        step="50"
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="w-24 h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>
             </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
                Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> results
            </p>
            {(selectedCategory !== 'All' || priceRange < 1000 || searchQuery) && (
                <button 
                    onClick={clearFilters}
                    className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1"
                >
                    <X className="h-3 w-3" /> Clear Filters
                </button>
            )}
        </div>

        {/* Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No products found</h3>
            <p className="text-gray-500 mt-1 max-w-sm text-center">
                We couldn't find anything matching your search. Try adjusting your filters or search terms.
            </p>
            <button 
              onClick={clearFilters}
              className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;