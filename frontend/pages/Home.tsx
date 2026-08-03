import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, ShieldCheck as BadgeCheck, Headphones, Lock, Gift, Shirt, Coffee, Image as ImageIcon, Smartphone, MoreHorizontal } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import api from '@/src/services/api';
import ProductCard from '@/src/components/product/ProductCard';
import AdCard from '@/src/components/product/AdCard';
import { cn } from '@/lib/utils';
import { Product } from '@/src/types';

// Themed to match the hero artwork's own category iconography (Apparel / Mugs /
// Posters / Phone Cases / & More), mapped to the real filterable categories.
const TOP_CATEGORIES = [
  { label: 'Apparel',     filter: 'T-Shirts',     icon: Shirt },
  { label: 'Mugs',        filter: 'Mugs',         icon: Coffee },
  { label: 'Posters',     filter: 'Photo Frames', icon: ImageIcon },
  { label: 'Phone Cases', filter: 'Mobile Case',  icon: Smartphone },
  { label: '& More',      filter: null,           icon: MoreHorizontal },
];

const TRUST_STRIP = [
  { icon: BadgeCheck, label: 'Premium Quality' },
  { icon: Headphones, label: '24/7 Support' },
  { icon: Lock,        label: 'Secure Payment' },
  { icon: Shirt,       label: 'Wide Range of Products' },
  { icon: Gift,        label: 'Perfect for Gifting' },
];

export default function Home() {
  const navigate = useNavigate();
  const [heroQuery, setHeroQuery] = useState('');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(heroQuery.trim())}`);
    }
  };

  // Hero fades out as the user scrolls it out of view at the top of the viewport
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const { data, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data } = await api.get('/products?limit=8');
      return data.products as Product[];
    },
  });

  // Memoize so the array reference is stable — prevents ProductCard re-renders
  // when unrelated state (e.g. navigate hover) updates the Home component
  const featuredProducts = useMemo(() => data || [], [data]);

  return (
    <div className="flex flex-col bg-background text-foreground min-h-screen transition-colors duration-200">
      {/* Hero — the banner artwork itself is the background; it's aspect-locked so it
          never crops on any screen size, and fades out as it scrolls past the top. */}
      <section ref={heroRef} className="relative w-full bg-white dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-900">
        <motion.div style={{ opacity: heroOpacity }} className="relative w-full aspect-[1532/688] overflow-hidden">
          <img
            src="/hero-banner.jpg"
            alt="GeekHoot — Gear up, stand out. For geeks, by geeks. Premium quality, unique designs, made for you."
            width={1532}
            height={688}
            fetchPriority="high"
            loading="eager"
            decoding="sync"
            className="absolute inset-0 w-full h-full object-cover object-center select-none"
            draggable={false}
          />

          {/* Category selection — overlaid on the artwork's open top band, same
              treatment as the Shop Now CTA, themed to match the banner's own iconography */}
          <div
            className="absolute z-10 hidden sm:flex items-stretch justify-between divide-x divide-black/10"
            style={{ top: '6%', left: '36%', right: '15%' }}
          >
            {TOP_CATEGORIES.map(({ label, filter, icon: Icon }) => (
              <button
                key={label}
                onClick={() => navigate(filter ? `/products?category=${encodeURIComponent(filter)}` : '/products')}
                aria-label={label}
                className="flex flex-col items-center justify-center text-gray-800 hover:text-[#e0122a] transition-colors cursor-pointer"
                style={{ padding: '0 clamp(4px,1.6vw,16px)', gap: 'clamp(1px,0.5vw,5px)' }}
              >
                <Icon style={{ width: 'clamp(11px,2.1vw,20px)', height: 'clamp(11px,2.1vw,20px)' }} aria-hidden="true" />
                <span style={{ fontSize: 'clamp(6px,1.05vw,11px)' }} className="font-bold uppercase tracking-wide whitespace-nowrap">{label}</span>
              </button>
            ))}
          </div>

          {/* Shop Now — overlaid on the artwork, scales fluidly with it at every breakpoint */}
          <button
            onClick={() => navigate('/products')}
            aria-label="Shop now"
            className="absolute left-[4.5%] top-[68%] inline-flex items-center bg-[#e0122a] hover:bg-[#0b0b0d] text-white font-bold rounded-full shadow-lg shadow-black/25 transition-all duration-150 active:scale-95 cursor-pointer"
            style={{
              padding: 'clamp(5px,1.3vw,14px) clamp(12px,3.2vw,32px)',
              fontSize: 'clamp(9px,1.6vw,16px)',
              gap: 'clamp(3px,0.8vw,8px)',
            }}
          >
            Shop Now
            <ArrowRight style={{ width: 'clamp(10px,1.5vw,18px)', height: 'clamp(10px,1.5vw,18px)' }} aria-hidden="true" />
          </button>

          {/* Floating search — same glassy overlay treatment as Shop Now, sits just
              below it in the same open part of the artwork */}
          <form
            onSubmit={handleHeroSearch}
            role="search"
            className="absolute left-[4.5%] top-[82%] flex items-center bg-white/20 backdrop-blur-md border border-white/40 rounded-full shadow-lg shadow-black/15"
            style={{
              width: 'min(58%, 380px)',
              padding: 'clamp(4px,1vw,8px) clamp(8px,2vw,16px)',
              gap: 'clamp(4px,1vw,8px)',
            }}
          >
            <Search style={{ width: 'clamp(10px,1.6vw,16px)', height: 'clamp(10px,1.6vw,16px)' }} className="text-white shrink-0" aria-hidden="true" />
            <input
              type="search"
              value={heroQuery}
              onChange={(e) => setHeroQuery(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="bg-transparent outline-none text-white placeholder-white/80 flex-1 min-w-0"
              style={{ fontSize: 'clamp(8px,1.4vw,13px)' }}
            />
          </form>
        </motion.div>

        {/* Visually hidden heading — keeps the page's semantic structure/SEO intact
            since the real headline text lives inside the banner image. */}
        <h1 className="sr-only">GeekHoot — Gear up. Stand out. For geeks, by geeks.</h1>

        {/* Category strip — mobile only; desktop/tablet gets the on-image overlay above,
            since the artwork is too compact there for a legible overlaid row */}
        <div className="sm:hidden bg-gray-50 dark:bg-zinc-900/60 border-t border-gray-100 dark:border-zinc-900 px-4 py-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-zinc-500 mb-3">Shop by Category</p>
          <div className="flex items-stretch gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {TOP_CATEGORIES.map(({ label, filter, icon: Icon }) => (
              <button
                key={label}
                onClick={() => navigate(filter ? `/products?category=${encodeURIComponent(filter)}` : '/products')}
                className="flex flex-col items-center gap-2 shrink-0 w-20 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 shadow-sm active:scale-95 transition-transform cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-[#fdeaec] dark:bg-red-950/30 flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 text-[#e0122a]" aria-hidden="true" />
                </div>
                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 text-center leading-tight whitespace-nowrap">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-[#0b0b0d] dark:bg-black">
        <div className="max-w-7xl mx-auto px-5 sm:px-4 md:px-8 py-5 sm:py-4 grid grid-cols-2 sm:flex sm:flex-wrap items-center sm:justify-between gap-x-4 gap-y-4 sm:gap-x-8 sm:gap-y-3">
          {TRUST_STRIP.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 text-white">
              <div className="w-7 h-7 sm:w-auto sm:h-auto rounded-full bg-white/5 sm:bg-transparent flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e0122a]" aria-hidden="true" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold tracking-wide leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 w-full">
        {/* Featured Products List */}
        <section className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm mb-8 sm:mb-12 transition-colors">
          <div className="flex justify-between items-center mb-5 sm:mb-8">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="w-1.5 h-6 sm:h-7 bg-[#e0122a] rounded-full" aria-hidden="true" />
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)' }} className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">Featured Arrivals</h2>
                <p className="text-[11px] sm:text-xs text-gray-400 dark:text-zinc-500 font-medium hidden sm:block">Fresh drops, picked for you</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/products')} 
              className="hidden sm:inline-flex rounded-full border-red-600 text-red-600 hover:bg-red-50 dark:border-zinc-700 dark:text-red-400 dark:hover:bg-zinc-800 font-bold"
            >
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-50 dark:bg-zinc-800 rounded animate-pulse"></div>
              ))
            ) : (
              featuredProducts.map((product: Product, i: number) => (
                <React.Fragment key={product.id}>
                  <ProductCard product={product} priority={i < 4} />
                  {(i + 1) % 8 === 0 && <AdCard />}
                </React.Fragment>
              ))
            )}
          </div>

          <Button 
            variant="outline" 
            onClick={() => navigate('/products')} 
            className="sm:hidden w-full mt-5 rounded-full border-red-600 text-red-600 hover:bg-red-50 dark:border-zinc-700 dark:text-red-400 dark:hover:bg-zinc-800 font-bold"
          >
            View All Products
          </Button>
        </section>

        {/* Below-fold sections deferred — don't block initial paint */}
        <React.Suspense fallback={null}>
          {/* Trending Section Overlay */}
        <section className="bg-[#0b0b0d] rounded-xl overflow-hidden relative p-8 sm:p-12 md:p-24 text-center">
           <div className="absolute inset-0 bg-gradient-to-br from-[#e0122a]/25 via-transparent to-transparent"></div>
           <div className="relative z-10 max-w-2xl mx-auto">
             <h2 style={{ fontFamily: 'var(--font-heading)' }} className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 sm:mb-6 uppercase tracking-tight">Unleash Your Creativity</h2>
             <p className="text-gray-400 mb-7 sm:mb-10 text-sm sm:text-lg">Join thousands of customers who trust Geekhoot for their custom printing needs. High quality, zero compromises.</p>
             <Button 
                onClick={() => navigate('/products')} 
                className="w-full sm:w-auto bg-[#e0122a] hover:bg-white text-white hover:text-[#0b0b0d] font-bold px-10 h-12 sm:h-14 rounded-full text-base sm:text-lg border-none"
              >
                Explore Full Collection
             </Button>
           </div>
        </section>
        </React.Suspense>
      </div>
    </div>

  );
}
