import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, 
  ShoppingCart, 
  MessageSquare, 
  Truck, 
  ShieldCheck, 
  ChevronRight, 
  Minus, 
  Plus, 
  Share2,
  PackageCheck,
  MapPin,
  MapPinned,
  ArrowRight,
  Zap,
  Heart,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { formatAPIError } from '@/src/services/api';
import { useAuthStore } from '@/src/store/authStore';
import { useCartStore } from '@/src/store/cartStore';
import { useWishlistStore } from '@/src/store/wishlistStore';
import { cn } from '@/lib/utils';
import LazyProductImage from '@/src/components/product/LazyProductImage';
import { ProductDetailSkeleton } from '@/src/components/common/Skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Product } from '@/src/types';
import { TSHIRT_SIZES, isSizedCategory } from '@/lib/sizes';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!id || id === 'undefined' || id === 'null') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f3f6] dark:bg-zinc-950 px-4">
        <div className="text-center max-w-md bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 text-[#e0122a] rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-gray-950 dark:text-white mb-2">Product Not Found</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
            The product you are trying to view does not exist or has been removed.
          </p>
          <Button onClick={() => navigate('/products')} className="bg-[#e0122a] hover:bg-[#0b0b0d] text-white font-bold w-full rounded-sm h-11 border-none">
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  return <ProductDetailContent key={id} id={id} />;
}

function ProductDetailContent({ id }: { id: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const { addItem, items: cart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  React.useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    setSelectedSize(null);
    setShowReviewForm(false);
    setReviewData({ rating: 5, comment: '' });
  }, [id]);

  const { data: product, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error('Invalid product ID');
      }
      const { data } = await api.get(`/products/${id}`);
      return data as Product & { reviews: any[], bookings: number };
    },
    enabled: !!id && id !== 'undefined' && id !== 'null',
  });

  const { data: canReviewData } = useQuery({
    queryKey: ['can-review', id],
    queryFn: async () => {
      if (!id || id === 'undefined' || id === 'null') {
        return false;
      }
      const { data } = await api.get(`/products/${id}/can-review`);
      return data.canReview as boolean;
    },
    enabled: !!id && id !== 'undefined' && id !== 'null' && isAuthenticated && !!product,
  });

  const canReview = canReviewData || false;

  const handleWhatsAppOrder = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    const isAddressDetailed = user.houseNo?.trim() && user.streetNear?.trim() && user.road?.trim();
    if (!isAddressDetailed) {
      toast.error('Please complete your detailed shipping address (House No, Street Near, Road) in your profile to place an order.');
      navigate('/profile');
      return;
    }

    if (sizeRequiredButNotChosen) {
      toast.error('Please select a size before ordering');
      return;
    }
    if (effectiveStock === 0) {
      toast.error(hasSizes ? `Size ${selectedSize} is out of stock!` : 'This product is out of stock!');
      return;
    }
    if (quantity > effectiveStock) {
      toast.error(`Only ${effectiveStock} items left in stock${hasSizes ? ` for size ${selectedSize}` : ''}`);
      return;
    }
    setIsLocationDialogOpen(true);
  };

  const processOrderWithLocation = async (useCurrent: boolean) => {
    setIsLocationDialogOpen(false);
    setIsOrdering(true);
    
    const uniqueId = Math.random().toString(36).substring(2, 10).toUpperCase();
    const adminNumber = (import.meta as any).env.VITE_WHATSAPP_ADMIN_NUMBER;

    if (useCurrent) {
      if (navigator.geolocation) {
        toast.info('Capturing location...');
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
            await finalizeOrder(uniqueId, adminNumber, locationUrl);
          },
          async () => {
            toast.error("Location access denied. Using profile location.");
            await finalizeOrder(uniqueId, adminNumber, (user as any).locationUrl);
          },
          { timeout: 10000 }
        );
      } else {
        await finalizeOrder(uniqueId, adminNumber, (user as any).locationUrl);
      }
    } else {
      await finalizeOrder(uniqueId, adminNumber, (user as any).locationUrl);
    }
  };

  const finalizeOrder = async (uniqueId: string, adminNumber: string, locationUrl?: string) => {
    try {
      await api.post('/orders', {
        userId: user.id,
        productId: product.id,
        quantity: quantity,
        size: selectedSize || undefined,
        totalAmount: product.price * quantity,
        orderCode: uniqueId,
        locationUrl: locationUrl
      });
      
      sendWhatsAppMessage(uniqueId, adminNumber, locationUrl);
    } catch (error: any) {
      console.error('Order failed:', error);
      toast.error(error.response?.data?.message || 'Order failed, redirecting to WhatsApp...');
      sendWhatsAppMessage(uniqueId, adminNumber, locationUrl);
    } finally {
      setIsOrdering(false);
    }
  };

  const sendWhatsAppMessage = (uniqueId: string, adminNumber: string, locationUrl?: string) => {
    const message = `Hello Geekhoot,
I want to order:
*Product:* ${product.name}
${selectedSize ? `*Size:* ${selectedSize}\n` : ''}*Qty:* ${quantity}
*Total:* ₹${(product.price * quantity).toLocaleString()}
*Order ID:* #${uniqueId}

*Customer Details:*
- Name: ${user.name}
- Phone: ${user.phone}

*Delivery Address:*
- House/Flat No: ${user.houseNo || 'N/A'}
- Street / Near: ${user.streetNear || 'N/A'}
- Road / Area: ${user.road || 'N/A'}
- District: ${user.district || 'N/A'}
- State: ${user.state || 'N/A'}
- Pincode: ${user.pincode || 'N/A'}
- Full Address: ${user.address || 'N/A'}
${locationUrl ? `*Location:* ${locationUrl}` : ''}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${adminNumber}?text=${encodedMessage}`, '_blank');
  };

  const handleAddToCart = () => {
    if (sizeRequiredButNotChosen) {
      toast.error('Please select a size before adding to cart');
      return;
    }
    if (effectiveStock === 0) {
      toast.error(hasSizes ? `Size ${selectedSize} is out of stock!` : 'This product is out of stock!');
      return;
    }
    const existingItem = cart.find(item => item.productId === product.id && (item.size || null) === (selectedSize || null));
    const existingQty = existingItem ? existingItem.quantity : 0;
    if (existingQty + quantity > effectiveStock) {
      toast.error(`Only ${effectiveStock} items available in stock${hasSizes ? ` for size ${selectedSize}` : ''}. You have ${existingQty} in your cart.`);
      return;
    }
    addItem(product, quantity, selectedSize);
    toast.success('Added to cart');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/products/${id}/reviews`, reviewData);
      toast.success('Review submitted');
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['can-review', id] });
    } catch (error: any) {
      const err = formatAPIError(error);
      toast.error(err.message);
    }
  };

  const handleLikeReview = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to react to reviews');
      navigate('/login');
      return;
    }
    try {
      await api.post(`/products/${id}/reviews/${reviewId}/like`);
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    } catch (error: any) {
      const err = formatAPIError(error);
      toast.error(err.message);
    }
  };

  const handleDislikeReview = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to react to reviews');
      navigate('/login');
      return;
    }
    try {
      await api.post(`/products/${id}/reviews/${reviewId}/dislike`);
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    } catch (error: any) {
      const err = formatAPIError(error);
      toast.error(err.message);
    }
  };

  if (isLoading || (!product && !isError)) return <ProductDetailSkeleton />;

  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f3f6] dark:bg-zinc-950 px-4">
        <div className="text-center max-w-md bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 text-[#e0122a] rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-gray-950 dark:text-white mb-2">Product Not Found</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
            The product you are trying to view does not exist or has been removed.
          </p>
          <Button onClick={() => navigate('/products')} className="bg-[#e0122a] hover:bg-[#0b0b0d] text-white font-bold w-full rounded-sm h-11 border-none">
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  const isCorrectProduct = product && String(product.id) === String(id);

  if (!isCorrectProduct) return <ProductDetailSkeleton />;

  const mainImage = (Array.isArray(product.images) && product.images.length > activeImage) 
    ? product.images[activeImage] 
    : '';

  // Sized products (e.g. T-Shirts) track stock per-size instead of (or in addition to) overall stock.
  const hasSizes = isSizedCategory(product.category) && !!product.sizeStock;
  const sizeStock: Record<string, number> = (product.sizeStock as Record<string, number>) || {};
  const effectiveStock = hasSizes
    ? (selectedSize ? (sizeStock[selectedSize] ?? 0) : 0)
    : product.stock;
  const sizeRequiredButNotChosen = hasSizes && !selectedSize;

  return (
    <div className="bg-[#f1f3f6] dark:bg-zinc-950 min-h-screen pb-20">
      <div className="max-w-[1440px] mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-500 mb-4 bg-white dark:bg-zinc-900 p-3 rounded shadow-sm">
          <Link to="/" className="hover:text-red-600 dark:hover:text-red-400">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-red-600 dark:hover:text-red-400">Collection</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 dark:text-zinc-200 font-medium truncate">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: Image Section */}
          <div className="lg:w-[40%] space-y-4">
            <div className="bg-white dark:bg-zinc-900 p-4 rounded shadow-sm sticky top-24">
              <div className="aspect-square relative overflow-hidden flex items-center justify-center border border-gray-100 dark:border-zinc-800 rounded-sm">
                <LazyProductImage 
                  src={mainImage} 
                  alt={product.name} 
                  className="max-w-full max-h-full object-contain"
                  containerClassName="w-full h-full"
                />
              </div>
              
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {Array.isArray(product.images) && product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1} of ${product.images.length}`}
                    aria-pressed={activeImage === i}
                    className={`w-16 h-16 shrink-0 rounded border-2 transition-all p-1 flex items-center justify-center ${activeImage === i ? 'border-[#e0122a]' : 'border-gray-100 dark:border-zinc-800'}`}
                  >
                    <LazyProductImage
                      src={img}
                      alt=""
                      className="max-w-full max-h-full object-contain"
                      containerClassName="w-full h-full"
                    />
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-6">
                <Button 
                  variant="outline"
                  className="h-14 rounded-sm border-gray-300 dark:border-zinc-700 font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || sizeRequiredButNotChosen || effectiveStock === 0}
                >
                  <ShoppingCart className="w-5 h-5 text-[#e0122a]" /> {product.stock === 0 ? 'Out of Stock' : (hasSizes && effectiveStock === 0 && selectedSize) ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Button 
                  className="h-14 rounded-sm bg-[#c00e22] hover:bg-[#e0122a] text-white font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-sm disabled:bg-gray-300 dark:disabled:bg-zinc-700 disabled:text-gray-500 dark:disabled:text-zinc-400 disabled:cursor-not-allowed border-none"
                  onClick={handleWhatsAppOrder}
                  disabled={product.stock === 0 || sizeRequiredButNotChosen || effectiveStock === 0}
                >
                  <Zap className="w-5 h-5 fill-white" /> {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                </Button>
              </div>
              {sizeRequiredButNotChosen && (
                <p className="text-[11px] text-center text-[#e0122a] font-bold mt-2">Select a size to continue</p>
              )}

              {/* Wishlist Toggle Action Button */}
              {(() => {
                const isWish = isInWishlist(product.id);
                return (
                  <Button 
                    variant="outline"
                    className={cn(
                      "w-full mt-2 h-12 rounded-sm font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all border shadow-sm cursor-pointer",
                      isWish 
                        ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-950/50" 
                        : "border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300"
                    )}
                    onClick={() => {
                      toggleWishlist(product);
                      if (isWish) {
                        toast.success(`${product.name} removed from wishlist`);
                      } else {
                        toast.success(`${product.name} added to wishlist`);
                      }
                    }}
                  >
                    <Heart className={cn("w-4 h-4", isWish ? "fill-red-500 text-red-500" : "text-gray-400 dark:text-zinc-500")} /> 
                    {isWish ? 'Wishlisted' : 'Add to Wishlist'}
                  </Button>
                );
              })()}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="lg:w-[60%] flex flex-col gap-4">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded shadow-sm min-h-full">
              <div className="mb-6">
                <p className="text-gray-400 dark:text-zinc-500 text-sm font-medium mb-1">{product.category}</p>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{product.name}</h1>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center bg-green-600 text-white px-2 py-0.5 rounded text-sm font-bold gap-1">
                    {Number(product.rating || 0).toFixed(1)} <Star className="w-3.5 h-3.5 fill-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-400 dark:text-zinc-500">
                    {product.reviews?.length || 0} Ratings & Reviews
                  </span>
                  {product.bookings > 0 && (
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {product.bookings} people ordered this
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-lg text-gray-400 dark:text-zinc-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                      <span className="text-lg text-green-600 dark:text-green-400 font-bold">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                      </span>
                    </>
                  )}
                </div>

                {!hasSizes && product.stock <= 5 && product.stock > 0 && (
                  <p className="text-red-500 dark:text-red-400 text-sm font-bold mb-4 italic">Only {product.stock} left in stock - order soon!</p>
                )}
                {!hasSizes && product.stock === 0 && (
                  <p className="text-red-500 dark:text-red-400 text-sm font-bold mb-4">Currently Out of Stock</p>
                )}
                {hasSizes && selectedSize && effectiveStock > 0 && effectiveStock <= 5 && (
                  <p className="text-red-500 dark:text-red-400 text-sm font-bold mb-4 italic">Only {effectiveStock} left in size {selectedSize} - order soon!</p>
                )}
                {hasSizes && selectedSize && effectiveStock === 0 && (
                  <p className="text-red-500 dark:text-red-400 text-sm font-bold mb-4">Size {selectedSize} is currently out of stock</p>
                )}

                {hasSizes && (
                  <div className="mb-4">
                    <span className="text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-widest block mb-2">
                      Select Size {selectedSize && <span className="text-gray-900 dark:text-white normal-case font-bold">— {selectedSize}</span>}
                    </span>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Size selector">
                      {TSHIRT_SIZES.map((size) => {
                        const qty = sizeStock[size] ?? 0;
                        const outOfStock = qty <= 0;
                        const isSelected = selectedSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            disabled={outOfStock}
                            onClick={() => {
                              setSelectedSize(size);
                              setQuantity(1);
                            }}
                            aria-pressed={isSelected}
                            aria-label={outOfStock ? `Size ${size}, out of stock` : `Select size ${size}`}
                            className={cn(
                              "w-12 h-12 rounded-md border text-sm font-bold flex items-center justify-center transition-all",
                              outOfStock
                                ? "bg-gray-100 dark:bg-zinc-800 text-gray-300 dark:text-zinc-600 border-gray-200 dark:border-zinc-700 cursor-not-allowed line-through"
                                : isSelected
                                  ? "bg-[#c00e22] border-[#c00e22] text-white shadow-sm"
                                  : "bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 hover:border-[#e0122a] hover:text-[#e0122a]"
                            )}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 dark:border-zinc-800 pt-6 space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Product Description</h3>
                  <p className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed">{product.description}</p>
                </div>

                <div className="flex items-center gap-6 border-y border-gray-50 dark:border-zinc-800 py-4">
                   <div className="flex items-center gap-2">
                     {/* upgraded text-gray-400 → text-gray-600 for WCAG AA */}
                     <span className="text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-widest">Quantity</span>
                     <div className="flex items-center border border-gray-200 dark:border-zinc-700 rounded" role="group" aria-label="Quantity selector">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          aria-label="Decrease quantity"
                          className="p-2 border-r dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-30"
                          disabled={effectiveStock === 0 || quantity <= 1}
                        >
                          <Minus className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <span className="w-12 text-center text-sm font-bold" aria-live="polite" aria-label={`Quantity: ${effectiveStock === 0 ? 0 : quantity}`}>{effectiveStock === 0 ? 0 : quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          aria-label="Increase quantity"
                          className="p-2 border-l dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-30"
                          disabled={effectiveStock === 0 || quantity >= effectiveStock}
                        >
                          <Plus className="w-4 h-4" aria-hidden="true" />
                        </button>
                     </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                    <Truck className="w-5 h-5 text-gray-400 dark:text-zinc-500 mt-1" />
                    <div>
                      <p className="text-sm font-bold dark:text-white">Free Delivery</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">Usually ships in 24-48 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-gray-400 dark:text-zinc-500 mt-1" />
                    <div>
                      <p className="text-sm font-bold dark:text-white">7 Days Replacement</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">Quality checking before dispatch</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews within Right Column or below? Standard e-commerce often puts it below */}
            <div id="reviews" className="bg-white dark:bg-zinc-900 p-6 rounded shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ratings & Reviews</h2>
                    {canReview && !showReviewForm && (
                        <Button variant="outline" onClick={() => setShowReviewForm(true)}>Rate Product</Button>
                    )}
                </div>

                <AnimatePresence>
                    {showReviewForm && (
                        <motion.div
                          initial={{ opacity: 0, scaleY: 0.92, transformOrigin: 'top' }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          exit={{ opacity: 0, scaleY: 0.92 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          style={{ willChange: 'transform, opacity' }}
                          className="overflow-hidden mb-8 border-b dark:border-zinc-800 pb-8">
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold dark:text-white">Rate:</span>
                                    <div className="flex gap-1" role="group" aria-label="Star rating">
                                        {[1,2,3,4,5].map(i => (
                                            <button
                                              key={i}
                                              type="button"
                                              onClick={() => setReviewData({ ...reviewData, rating: i })}
                                              aria-label={`Rate ${i} star${i !== 1 ? 's' : ''}`}
                                              aria-pressed={reviewData.rating === i}
                                            >
                                                <Star className={`w-6 h-6 ${reviewData.rating >= i ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-zinc-700'}`} aria-hidden="true" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    className="w-full border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-md p-4 text-sm focus:ring-1 focus:ring-[#e0122a] outline-none"
                                    placeholder="Write your review here..."
                                    rows={4}
                                    value={reviewData.comment}
                                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="ghost" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                                    <Button type="submit" className="bg-black dark:bg-white text-white dark:text-black px-8">Submit</Button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-6">
                    {product.reviews?.length > 0 ? product.reviews.map((review: any) => {
                        const userLiked = review.likedBy?.includes(user?.id);
                        const userDisliked = review.dislikedBy?.includes(user?.id);
                        return (
                            <div key={review.id} className="border-b border-gray-100 dark:border-zinc-800 pb-6 last:border-0">
                                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center bg-green-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold gap-1">
                                            {Number(review.rating || 0).toFixed(1)} <Star className="w-2.5 h-2.5 fill-white" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{review.user?.name}</span>
                                    </div>
                                    {review.isVerifiedPurchase && (
                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/50">
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                            Verified Purchase
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-700 dark:text-zinc-300 mb-2 leading-relaxed">{review.comment}</p>
                                <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
                                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">Published on {new Date(review.createdAt).toLocaleDateString()}</p>
                                    
                                    {/* Like & Dislike interaction button row */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleLikeReview(review.id)}
                                            className={cn(
                                                "flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer",
                                                userLiked
                                                    ? "bg-red-50 dark:bg-red-950/30 text-[#e0122a] border-red-200 dark:border-red-900/50 font-semibold"
                                                    : "bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700"
                                            )}
                                        >
                                            <ThumbsUp className={cn("w-3 h-3", userLiked && "fill-[#e0122a]")} />
                                            <span>Helpful ({review.likes || 0})</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDislikeReview(review.id)}
                                            className={cn(
                                                "flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer",
                                                userDisliked
                                                    ? "bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 border-zinc-300 dark:border-zinc-600 font-semibold"
                                                    : "bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700"
                                            )}
                                        >
                                            <ThumbsDown className={cn("w-3 h-3", userDisliked && "fill-zinc-700")} />
                                            <span>Not Helpful ({review.dislikes || 0})</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-10">
                            <MessageSquare className="w-10 h-10 text-gray-100 dark:text-zinc-700 mx-auto mb-4" />
                            <p className="text-sm text-gray-400 dark:text-zinc-500 italic">No reviews yet. Be the first to review!</p>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Dialog remains similar but cleaner UI */}
      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent className="max-w-md rounded-lg p-6 bg-white dark:bg-zinc-900 border-none shadow-2xl ring-0">
          <DialogHeader className="mb-6 text-left">
            <DialogTitle className="text-xl font-bold dark:text-white">Select Delivery Location</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-zinc-400 text-sm">
              We need your location to process the order correctly on WhatsApp.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <button 
              onClick={() => processOrderWithLocation(true)}
              className="w-full flex items-center gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors text-left"
            >
              <MapPinned className="w-6 h-6 text-[#e0122a]" />
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Current Location</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">Detected via GPS for precision</p>
              </div>
            </button>

            <button 
              onClick={() => processOrderWithLocation(false)}
              className="w-full flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700/70 transition-colors text-left"
            >
              <MapPin className="w-6 h-6 text-gray-400 dark:text-zinc-500" />
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Profile Address</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">Use address saved in your account</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading Overlay */}
      {isOrdering && (
        <div className="fixed inset-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm z-[100] flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-48 h-2 bg-zinc-200 dark:bg-zinc-700 rounded overflow-hidden mx-auto relative">
                  <div className="absolute top-0 left-0 h-full bg-[#e0122a] rounded animate-pulse w-full" />
                </div>
                <p className="text-sm font-bold text-gray-600 dark:text-zinc-300 animate-pulse">Processing Order...</p>
            </div>
        </div>
      )}
    </div>
  );
}
