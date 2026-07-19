import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, Zap, Star, Quote, ShieldCheck as BadgeCheck, Headphones, Lock, Gift, Shirt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import api from '@/src/services/api';
import ProductCard from '@/src/components/product/ProductCard';
import AdCard from '@/src/components/product/AdCard';
import { cn } from '@/lib/utils';
import { Product } from '@/src/types';

const FEATURED_CATEGORIES = [
  { label: 'Custom T-Shirts', filter: 'T-Shirts',    icon: '👕' },
  { label: 'Name Slips',      filter: 'Name Slips',  icon: '🏷️' },
  { label: 'Printed Bottles', filter: 'Bottles',     icon: '🍼' },
  { label: 'Mugs',            filter: 'Mugs',        icon: '☕' },
  { label: 'Photo Frames',    filter: 'Photo Frames',icon: '🖼️' },
  { label: 'Keychain',        filter: 'Keychain',    icon: '🔑' },
  { label: 'Stationery',      filter: 'Stationery',  icon: '✏️' },
  { label: 'Mobile Cases',    filter: 'Mobile Case', icon: '📱' },
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-white dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-900">
        {/* Decorative marks */}
        <div className="pointer-events-none absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full bg-[#e0122a]/[0.06] blur-2xl" aria-hidden="true" />
        <div className="pointer-events-none absolute left-1/3 bottom-0 w-72 h-72 rounded-full bg-[#0b0b0d]/[0.03] dark:bg-white/[0.03] blur-2xl" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-8 md:pt-16 md:pb-12 relative">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Copy */}
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#e0122a] bg-[#fdeaec] dark:bg-red-950/30 px-3 py-1.5 rounded-full mb-5">
                Gear up. Stand out.
              </span>
              <h1 style={{ fontFamily: 'var(--font-heading)' }} className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.02] tracking-tight text-gray-900 dark:text-white mb-5">
                For geeks.<br />
                <span className="text-[#e0122a]">By geeks.</span>
              </h1>
              <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-md mb-8">
                Premium apparel, mugs, posters and phone cases — custom printed and made just for you.
              </p>
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  className="bg-[#e0122a] hover:bg-[#c00e22] text-white font-bold h-13 px-8 rounded-full shadow-lg shadow-red-600/20 border-none"
                  onClick={() => navigate('/products')}
                >
                  Shop Now <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
                <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <Truck className="w-4 h-4 text-[#e0122a]" aria-hidden="true" />
                  Fast delivery, nationwide
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="relative z-10 lg:justify-self-end w-full max-w-md">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/10 border border-gray-100 dark:border-zinc-800 aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop&fm=webp"
                  alt=""
                  width={1000}
                  height={750}
                  fetchPriority="high"
                  loading="eager"
                  decoding="sync"
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-5 -left-5 bg-[#0b0b0d] text-white rounded-2xl px-5 py-3 shadow-xl flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-[#e0122a]" aria-hidden="true" />
                <span className="text-xs font-bold tracking-wide">Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category strip */}
        <div className="border-t border-gray-100 dark:border-zinc-900 overflow-x-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 gap-8 min-w-max py-5">
            {FEATURED_CATEGORIES.map((cat, i) => (
              <div
                key={i}
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.filter)}`)}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 flex items-center justify-center text-2xl md:text-3xl transition-all group-hover:scale-110 group-hover:border-[#e0122a]/40 group-hover:bg-[#fdeaec] dark:group-hover:bg-red-950/20">
                  {cat.icon}
                </div>
                <span className="text-[11px] md:text-xs font-semibold text-gray-600 dark:text-gray-400 group-hover:text-[#e0122a] dark:group-hover:text-[#e0122a] text-center leading-tight">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-[#0b0b0d] dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-wrap items-center justify-center sm:justify-between gap-x-8 gap-y-3">
          {TRUST_STRIP.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 text-white">
              <Icon className="w-4 h-4 text-[#e0122a] shrink-0" aria-hidden="true" />
              <span className="text-xs font-bold tracking-wide whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Featured Products List */}
        <section className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm mb-12 transition-colors">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-7 bg-[#e0122a] rounded-full" aria-hidden="true" />
              <h2 style={{ fontFamily: 'var(--font-heading)' }} className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Featured Product Arrivals</h2>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/products')} 
              className="rounded-full border-red-600 text-red-600 hover:bg-red-50 dark:border-zinc-700 dark:text-red-400 dark:hover:bg-zinc-800 font-bold"
            >
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
        </section>

        {/* Below-fold sections deferred — don't block initial paint */}
        <React.Suspense fallback={null}>
          {/* Brand Promises */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <div className="flex items-center gap-4 p-6 bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-100/65 dark:border-red-900/30 transition-colors">
             <Truck className="w-8 h-8 text-red-600" />
             <div>
               <h3 className="font-bold text-gray-900 dark:text-white">Fast Shipping</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400">Express delivery within 48-72 hours</p>
             </div>
           </div>
           <div className="flex items-center gap-4 p-6 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-100/65 dark:border-green-900/30 transition-colors">
             <ShieldCheck className="w-8 h-8 text-green-600" />
             <div>
               <h3 className="font-bold text-gray-900 dark:text-white">Quality Assured</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400">Every product goes through multi-level QC</p>
             </div>
           </div>
           <div className="flex items-center gap-4 p-6 bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-100/65 dark:border-red-900/30 transition-colors">
             <Zap className="w-8 h-8 text-[#e0122a]" />
             <div>
               <h3 className="font-bold text-gray-900 dark:text-white">Easy Support</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400">Direct WhatsApp support for orders</p>
             </div>
           </div>
        </div>

        {/* Trending Section Overlay */}
        <section className="bg-[#0b0b0d] rounded-xl overflow-hidden relative p-12 md:p-24 text-center">
           <div className="absolute inset-0 bg-gradient-to-br from-[#e0122a]/25 via-transparent to-transparent"></div>
           <div className="relative z-10 max-w-2xl mx-auto">
             <h2 style={{ fontFamily: 'var(--font-heading)' }} className="text-3xl md:text-5xl font-bold text-white mb-6 uppercase tracking-tight">Unleash Your Creativity</h2>
             <p className="text-gray-400 mb-10 text-lg">Join thousands of customers who trust Geekhoot for their custom printing needs. High quality, zero compromises.</p>
             <Button 
                onClick={() => navigate('/products')} 
                className="bg-[#e0122a] hover:bg-white text-white hover:text-[#0b0b0d] font-bold px-10 h-14 rounded-full text-lg border-none"
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
