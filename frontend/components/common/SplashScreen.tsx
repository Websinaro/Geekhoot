import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 600);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ willChange: 'opacity' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#ff5200] overflow-hidden"
        >
          {/* Background blobs — static, no animation to avoid non-composited paint */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#ff7300] rounded-full opacity-20 pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#ff9100] rounded-full opacity-20 pointer-events-none" />

          <div className="relative flex flex-col items-center">
            {/* Logo — uses scale + opacity only (composited) */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'backOut' }}
              style={{ willChange: 'transform, opacity' }}
              className="mb-8"
            >
              <div className="w-28 h-28 bg-white rounded-3xl shadow-2xl flex items-center justify-center ring-4 ring-white/20">
                {/* Inner G bounces on Y axis only — composited translate */}
                <motion.span
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ willChange: 'transform', display: 'inline-block' }}
                  className="text-5xl font-black text-[#ff5200]"
                >
                  G
                </motion.span>
              </div>
            </motion.div>

            {/* Staggered letters — opacity + translateY only, no filter:blur */}
            <div className="flex justify-center">
              {"Geekhoot".split("").map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.4 + i * 0.07,
                    type: 'spring',
                    stiffness: 120,
                    damping: 14,
                  }}
                  style={{ willChange: 'transform, opacity' }}
                  className="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl"
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.4 }}
              style={{ willChange: 'transform, opacity' }}
              className="mt-6 flex flex-col items-center"
            >
              <p className="text-white/90 text-center font-bold tracking-[0.25em] uppercase text-sm mb-2">
                Premium Custom Merch
              </p>
              <div className="h-0.5 w-12 bg-white/40 rounded-full" />
            </motion.div>
          </div>

          {/* Progress bar — scaleX instead of width (composited, no layout recalc) */}
          <div className="absolute bottom-20 left-12 right-12 h-1.5 bg-black/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full w-full bg-white origin-left shadow-[0_0_15px_rgba(255,255,255,0.8)]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 2.4, ease: 'linear' }}
              style={{ willChange: 'transform' }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-8 text-white/40 text-[10px] uppercase tracking-widest font-medium"
          >
            Built by WEBSINARO WB
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
