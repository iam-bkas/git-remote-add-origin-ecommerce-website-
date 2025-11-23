import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Truck, Shield, ArrowLeft, Plus, Minus, Sparkles, AlertTriangle, Check, Home, User as UserIcon, Send } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { generateProductPitch } from '../services/gemini';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, user, addReview } = useStore();
  const product = products.find(p => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [aiPitch, setAiPitch] = useState<string>('');
  const [isLoadingPitch, setIsLoadingPitch] = useState(false);
  const [activeImage, setActiveImage] = useState<string>('');
  
  // Review State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      setIsLoadingPitch(true);
      generateProductPitch(product.name, product.description)
        .then(pitch => setAiPitch(pitch))
        .finally(() => setIsLoadingPitch(false));
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
        <Link to="/shop" className="text-indigo-600 hover:underline">Back to Shop</Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  
  // Mocking multiple images for gallery effect
  const galleryImages = [
      product.image,
      product.image, 
      product.image, 
      product.image
  ];

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmittingReview(true);
    // Simulate delay
    setTimeout(() => {
        addReview(product.id, {
            userId: user.id,
            userName: user.name,
            rating: reviewRating,
            comment: reviewComment
        });
        setReviewComment('');
        setReviewRating(5);
        setIsSubmittingReview(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-100 py-3">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link to="/" className="hover:text-indigo-600"><Home className="h-3 w-3" /></Link>
                <span>/</span>
                <Link to="/shop" className="hover:text-indigo-600">Shop</Link>
                <span>/</span>
                <Link to={`/shop?category=${product.category}`} className="hover:text-indigo-600">{product.category}</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/shop" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors group">
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 mb-20">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 relative group">
              <img
                src={activeImage}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-500 ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
              />
              {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10">
                      <span className="bg-gray-900 text-white px-6 py-3 rounded-full font-bold text-lg shadow-xl backdrop-blur-md">
                          Out of Stock
                      </span>
                  </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
               {galleryImages.map((img, idx) => (
                 <button 
                    key={idx} 
                    onClick={() => setActiveImage(img)}
                    className={`aspect-square bg-gray-50 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${activeImage === img ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent hover:border-gray-300'}`}
                 >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                 </button>
               ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-4 flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wide">
                    {product.category}
                </span>
                <div className="flex items-center text-yellow-500 text-sm">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`} />
                    ))}
                    <span className="ml-2 text-gray-600 font-medium">{product.rating.toFixed(1)} ({product.reviews} reviews)</span>
                </div>
            </div>

            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
                 <p className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
                 
                 {/* Stock Status */}
                 {isOutOfStock ? (
                    <span className="flex items-center gap-1 text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full text-sm">
                        <AlertTriangle className="h-4 w-4" /> Out of Stock
                    </span>
                 ) : isLowStock ? (
                    <span className="flex items-center gap-1 text-orange-600 font-medium bg-orange-50 px-3 py-1 rounded-full text-sm">
                        <AlertTriangle className="h-4 w-4" /> Only {product.stock} left!
                    </span>
                 ) : (
                    <span className="flex items-center gap-1 text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full text-sm">
                        <Check className="h-4 w-4" /> In Stock
                    </span>
                 )}
            </div>
            
            {/* AI Pitch Section */}
            <div className="mb-8 p-5 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Sparkles className="h-24 w-24 text-indigo-900" />
                </div>
                <div className="flex items-center gap-2 mb-2 relative z-10">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Operator's Insight</span>
                </div>
                {isLoadingPitch ? (
                    <div className="h-4 bg-indigo-200 rounded animate-pulse w-3/4"></div>
                ) : (
                    <p className="text-indigo-900 italic font-medium text-lg relative z-10">"{aiPitch}"</p>
                )}
            </div>

            <div className="prose prose-sm text-gray-600 mb-8">
              <p>{product.description}</p>
              <h4 className="font-bold text-gray-900 mt-4 mb-2">Key Features</h4>
              <ul className="space-y-2">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-600"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="mt-auto pt-8 border-t border-gray-100">
              <div className="flex gap-4 mb-6">
                <div className="flex items-center border border-gray-300 rounded-xl bg-white">
                    <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={isOutOfStock || quantity <= 1}
                        className="p-3 hover:bg-gray-50 text-gray-600 rounded-l-xl disabled:opacity-50"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 font-bold min-w-[3ch] text-center">{quantity}</span>
                    <button 
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={isOutOfStock || quantity >= product.stock}
                        className="p-3 hover:bg-gray-50 text-gray-600 rounded-r-xl disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
                <button
                  onClick={() => {
                      for(let i=0; i<quantity; i++) addToCart(product);
                  }}
                  disabled={isOutOfStock}
                  className="flex-1 bg-gray-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Truck className="h-5 w-5 text-gray-900" />
                    <span>Free Delivery over $150</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="h-5 w-5 text-gray-900" />
                    <span>2 Year Official Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* REVIEWS SECTION */}
        <div className="border-t border-gray-100 pt-16">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">Customer Reviews</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Summary & Form */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
                        <div className="text-5xl font-bold text-gray-900 mb-2">{product.rating.toFixed(1)}</div>
                        <div className="flex justify-center gap-1 text-yellow-500 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-5 w-5 ${i < Math.round(product.rating) ? 'fill-current' : 'text-gray-300'}`} />
                            ))}
                        </div>
                        <p className="text-gray-500 text-sm">Based on {product.reviews} reviews</p>
                    </div>

                    {user ? (
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewRating(star)}
                                                className={`focus:outline-none transition-transform hover:scale-110 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                                            >
                                                <Star className={`h-6 w-6 ${star <= reviewRating ? 'fill-current' : ''}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                                    <textarea
                                        required
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        rows={4}
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-3 border text-sm"
                                        placeholder="Share your thoughts about this product..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmittingReview || !reviewComment.trim()}
                                    className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                                    {!isSubmittingReview && <Send className="h-4 w-4" />}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-center">
                            <h3 className="font-bold text-indigo-900 mb-2">Share your thoughts</h3>
                            <p className="text-sm text-indigo-700 mb-4">Please sign in to write a review.</p>
                            <Link to="/login" className="inline-block bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
                                Sign In
                            </Link>
                        </div>
                    )}
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-2">
                    {product.reviewsList && product.reviewsList.length > 0 ? (
                        <div className="space-y-6">
                            {product.reviewsList.map((review) => (
                                <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                <UserIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{review.userName}</h4>
                                                <p className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5 text-yellow-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                            <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                                <Sparkles className="h-full w-full" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
                            <p className="text-gray-500">Be the first to share your experience!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;