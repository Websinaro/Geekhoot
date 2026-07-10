import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/src/store/cartStore';
import { useWishlistStore } from '@/src/store/wishlistStore';
import { toast } from 'sonner';
import { Product } from '@/src/types';
import { isSizedCategory } from '@/lib/sizes';
import LazyProductImage from './LazyProductImage';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const navigate = useNavigate();
  const isWish = isInWishlist(product.id);
  const needsSizeSelection = isSizedCategory(product.category) && !!product.sizeStock;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (needsSizeSelection) {
      // Sized products require picking a size first, so send the shopper to the product page.
      navigate(`/product/${product.id}`);
      toast.info('Please select a size to add this item to your cart');
      return;
    }
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    toast.success(isWish ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`);
  };

  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ willChange: 'transform, opacity' }}
      className="group relative bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-zinc-800 flex flex-col h-full"
    >
      {/* Image area */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50 dark:bg-zinc-800">

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1">
          {discountPct > 0 && (
            <Badge className="bg-[#ff5200] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm border-none shadow-sm">
              {discountPct}% off
            </Badge>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label={isWish ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className={cn(
            "absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center",
            "shadow-sm border border-gray-100 dark:border-zinc-700",
            "transition-all duration-150 active:scale-90 active:opacity-75",
            isWish
              ? "bg-red-50 dark:bg-red-950/40 text-red-500"
              : "bg-white/90 dark:bg-zinc-900/90 text-gray-400 hover:text-red-500"
          )}
        >
          <Heart className={cn("w-4 h-4 transition-colors", isWish && "fill-red-500")} aria-hidden="true" />
        </button>

        <LazyProductImage
          src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : ''}
          alt={product.name}
          priority={priority}
          width={400}
          height={400}
          className="transition-transform duration-500 group-hover:scale-105"
          containerClassName="w-full h-full"
        />

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-gray-800 dark:bg-zinc-700 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-md">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product info */}
      <Link to={`/product/${product.id}`} className="flex flex-col flex-1 p-3 sm:p-4">
        {/* Category */}
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 uppercase tracking-wide truncate">
          {product.category}
        </p>

        {/* Name */}
        <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-[#ff5200] transition-colors line-clamp-2 mb-2 leading-snug">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5 bg-green-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
            <span>{Number(product.rating || 0).toFixed(1)}</span>
            <Star className="w-2.5 h-2.5 fill-white" aria-hidden="true" />
          </div>
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            ({product._count?.reviews || 0})
          </span>
        </div>

        {/* Price */}
        <div className="mt-auto flex items-baseline gap-2 flex-wrap">
          <span className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
            ₹{product.price.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </Link>

      {/* Add to cart button */}
      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          aria-label={`Add ${product.name} to cart`}
          className={cn(
            "w-full h-10 rounded-lg font-bold text-xs sm:text-sm",
            "flex items-center justify-center gap-2",
            "transition-all duration-150 active:scale-[0.97] active:opacity-80",
            "border-none shadow-sm",
            product.stock === 0
              ? "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 cursor-not-allowed"
              : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-[#ff5200] dark:hover:bg-[#ff5200] dark:hover:text-white"
          )}
        >
          <ShoppingCart className="w-4 h-4" aria-hidden="true" />
          {product.stock === 0 ? 'Out of Stock' : needsSizeSelection ? 'Select Size' : 'Add to Cart'}
        </button>
      </div>
    </motion.div>
  );
}
