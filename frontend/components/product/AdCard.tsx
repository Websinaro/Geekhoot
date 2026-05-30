import React, { useEffect, useRef } from 'react';

/**
 * AdCard — renders a Google AdSense ad styled to match ProductCard dimensions.
 * Uses the "auto" responsive format so Google picks the best ad size for the slot.
 */
export default function AdCard() {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // silently ignore if AdSense hasn't loaded yet
    }
  }, []);

  return (
    <div
      ref={adRef}
      className="group relative bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col h-full min-h-[260px]"
      aria-label="Advertisement"
    >
      {/* Subtle "Ad" label — same position as discount badge in ProductCard */}
      <span className="absolute top-2.5 left-2.5 z-20 bg-gray-100 dark:bg-zinc-700 text-gray-400 dark:text-zinc-400 text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wide uppercase select-none">
        Ad
      </span>

      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%', minHeight: '260px' }}
        data-ad-client="ca-pub-9691617107378387"
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
