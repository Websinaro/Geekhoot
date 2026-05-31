import React, { useState, useEffect, useRef } from 'react';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Appends Cloudinary auto-format and auto-quality transformations to a URL.
 * Works for both Cloudinary URLs and plain URLs (passthrough).
 * e.g. https://res.cloudinary.com/.../image/upload/v1/geekhoot/x.jpg
 *   →  https://res.cloudinary.com/.../image/upload/f_auto,q_auto/v1/geekhoot/x.jpg
 */
function optimizeCloudinaryUrl(src: string): string {
  if (!src) return src;
  try {
    if (src.includes('res.cloudinary.com') && src.includes('/image/upload/')) {
      // Avoid double-inserting transformations
      if (src.includes('f_auto') || src.includes('q_auto')) return src;
      return src.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
    }
  } catch {
    // fall through
  }
  return src;
}

interface LazyProductImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  /**
   * priority=true: above-the-fold / LCP image.
   * Skips IntersectionObserver, sets fetchpriority="high", no loading="lazy".
   * Use for the first visible product card and hero images.
   */
  priority?: boolean;
  width?: number;
  height?: number;
}

export default function LazyProductImage({
  src,
  alt,
  className,
  containerClassName,
  priority = false,
  width,
  height,
  ...props
}: LazyProductImageProps) {
  const [isLoaded, setIsLoaded]   = useState(false);
  const [isInView, setIsInView]   = useState(priority); // priority images are always "in view"
  const [hasError, setHasError]   = useState(false);
  const imgRef                    = useRef<HTMLDivElement>(null);
  const optimizedSrc              = optimizeCloudinaryUrl(src);

  useEffect(() => {
    if (priority) return; // skip observer for priority images

    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '150px', threshold: 0.01 }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src, priority]);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-zinc-50 flex items-center justify-center w-full h-full select-none',
        containerClassName
      )}
    >
      {/* Skeleton — only shown while not yet loaded */}
      {(!isLoaded || !isInView) && !hasError && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100 flex items-center justify-center animate-pulse"
          style={{ backgroundSize: '200% 100%' }}
        >
          <ImageIcon className="w-8 h-8 text-zinc-300" />
        </div>
      )}

      {isInView && (
        <img
          src={optimizedSrc || undefined}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          // Priority images: no lazy loading, high fetch priority
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding={priority ? 'sync' : 'async'}
          width={width}
          height={height}
          className={cn(
            'w-full h-full object-cover transition-all duration-500',
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
            hasError ? 'hidden' : '',
            className
          )}
          {...props}
        />
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 text-zinc-400 p-2 text-center">
          <ImageIcon className="w-6 h-6 mb-1 text-zinc-300" />
          <span className="text-[10px] font-medium max-w-[80%] line-clamp-1">{alt}</span>
        </div>
      )}
    </div>
  );
}
