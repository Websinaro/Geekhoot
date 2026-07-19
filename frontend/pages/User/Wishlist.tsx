import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlistStore } from '@/src/store/wishlistStore';
import { useCartStore } from '@/src/store/cartStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Wishlist() {
  const { items, removeFromWishlist, clearWishlist, fetchWishlist, isLoading } = useWishlistStore();
  const { addItem } = useCartStore();

  React.useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleMoveToCart = (product: any) => {
    addItem(product);
    removeFromWishlist(product.id);
    toast.success(`${product.name} moved to cart`);
  };

  return (
    <div className="bg-[#f1f3f6] dark:bg-zinc-950 min-h-screen text-black dark:text-white">
      <div className="max-w-[1440px] mx-auto px-4 py-8 lg:py-12">
        {/* Wishlist Header Card */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              My Wishlist
              <span className="text-gray-400 dark:text-zinc-500 text-sm font-normal">({items.length} items)</span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-zinc-400">Your curated collection of premium printed custom gear</p>
          </div>

          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearWishlist();
                toast.success('Wishlist cleared');
              }}
              className="text-xs font-semibold text-red-500 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 rounded-md cursor-pointer self-start sm:self-center"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear Wishlist
            </Button>
          )}
        </div>

        {isLoading && items.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-xl shadow-sm space-y-3">
                <div className="aspect-square w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2 animate-pulse" />
                <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ willChange: 'transform, opacity' }}
            className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm p-12 text-center max-w-xl mx-auto mt-8 flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-red-400 stroke-1" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-8 max-w-sm">
              Save items you like in your wishlist to purchase or customize them later.
            </p>
            <Link to="/products">
              <Button className="bg-[#e0122a] hover:bg-red-600 text-white font-bold rounded-full px-8 h-11 border-none shadow-sm cursor-pointer">
                Discover Products
              </Button>
            </Link>
          </motion.div>
        ) : (
          /* Wishlisted Items List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ willChange: 'transform, opacity' }}
                className="bg-white dark:bg-zinc-900 group rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-zinc-800 flex flex-col h-full relative"
              >
                {/* Remove button on hover top corner */}
                <button
                  onClick={() => {
                    removeFromWishlist(product.id);
                    toast.success(`${product.name} removed from wishlist`);
                  }}
                  className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 dark:bg-zinc-900/90 text-gray-400 dark:text-zinc-500 hover:text-red-500 shadow-sm hover:scale-110 active:scale-95 transition-all cursor-pointer border-none"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Link to={`/product/${product.id}`} className="block flex-grow">
                  <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-zinc-800 flex items-center justify-center">
                    <img
                      src={(Array.isArray(product.images) && product.images.length > 0) ? product.images[0] : ''}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm flex items-center justify-center z-10">
                        <span className="bg-gray-800 dark:bg-zinc-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col">
                    <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium mb-1">{product.category}</p>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-[#e0122a] transition-colors line-clamp-2 mb-2 min-h-[40px]">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-baseline gap-2 mt-auto">
                      <span className="text-base font-extrabold text-gray-900 dark:text-white">₹{product.price.toLocaleString()}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs text-gray-400 dark:text-zinc-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </Link>

                <div className="p-4 pt-0">
                  <Button
                    onClick={() => handleMoveToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full h-11 bg-[#e0122a] hover:bg-[#0b0b0d] text-white disabled:bg-gray-100 dark:disabled:bg-zinc-800 disabled:text-gray-400 dark:disabled:text-zinc-500 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 border-none shadow-sm cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" /> Move to Cart
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
