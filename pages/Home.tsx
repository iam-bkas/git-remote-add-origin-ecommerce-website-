import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';

const Home = () => {
  const { products } = useStore();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Hero Background"
            className="w-full h-full object-cover filter brightness-[0.6]"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-white text-sm font-medium backdrop-blur-sm mb-6 border border-white/30">
            Spring Collection 2024
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
            Curated for the <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">Modern Life</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light">
            Experience the fusion of timeless design and artificial intelligence. 
            Let our AI stylist guide you to your perfect match.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/shop"
              className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              Shop Collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Free Shipping</h3>
                <p className="text-sm text-gray-500">On all orders over $150</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Secure Payment</h3>
                <p className="text-sm text-gray-500">Protected by Stripe</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">30 Day Returns</h3>
                <p className="text-sm text-gray-500">Hassle-free return policy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Trending Now</h2>
              <p className="text-gray-500">Our most coveted pieces this week.</p>
            </div>
            <Link to="/shop" className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* AI Teaser Section */}
      <section className="py-20 bg-indigo-900 relative overflow-hidden">
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-800 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-purple-800 rounded-full blur-3xl opacity-50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
            Not sure what to buy?
          </h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            Our AI Stylist "Operator" analyzes your preferences to suggest the perfect items for your lifestyle.
          </p>
          <button 
             onClick={() => document.querySelector<HTMLButtonElement>('[aria-label="Open AI Stylist"]')?.click()}
             className="px-8 py-3 bg-white text-indigo-900 rounded-full font-bold hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Chat with Operator
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;