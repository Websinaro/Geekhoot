import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 600);
    }, 2800);
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
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden"
        >
          {/* Subtle background radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,82,0,0.06)_0%,_transparent_70%)] pointer-events-none" />

          <div className="relative flex flex-col items-center gap-8">

            {/* Logo image — scale + opacity only (composited) */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.55, ease: 'backOut' }}
              style={{ willChange: 'transform, opacity' }}
            >
              <img
                src="/logo.png"
                alt="GeekHoot logo"
                className="w-52 h-52 object-contain drop-shadow-sm"
                draggable={false}
              />
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4, ease: 'easeOut' }}
              style={{ willChange: 'transform, opacity' }}
              className="text-gray-400 text-sm font-medium tracking-[0.2em] uppercase"
            >
              Premium Custom Merch
            </motion.p>
          </div>

          {/* Progress bar — scaleX (compositor-only, no layout recalc) */}
          <div className="absolute bottom-16 left-12 right-12 h-[3px] bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full w-full bg-[#ff5200] origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 2.6, ease: 'linear' }}
              style={{ willChange: 'transform' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
