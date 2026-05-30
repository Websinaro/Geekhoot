import React, { useEffect, useRef } from 'react';

/**
 * AdCard — renders your AdSense fluid ad styled to match the ProductCard grid item.
 */
export default function AdCard() {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, []);

  return (
    <div
      className="group relative bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col h-full min-h-[300px]"
      aria-label="Advertisement"
    >
      {/* Subtle "Ad" label matching ProductCard badge position */}
      <span className="absolute top-2.5 left-2.5 z-20 bg-gray-100 dark:bg-zinc-700 text-gray-400 dark:text-zinc-400 text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wide uppercase select-none pointer-events-none">
        Ad
      </span>

      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%', minHeight: '300px' }}
        data-ad-format="fluid"
        data-ad-layout-key="-6t+ed+2i-1n-4w"
        data-ad-client="ca-pub-9691617107378387"
        data-ad-slot="6031106781"
      />
    </div>
  );
}
