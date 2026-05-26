import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          name: 'Geekhoot Printing Store',
          short_name: 'Geekhoot',
          description: 'Premium print processing and customization ecommerce store.',
          theme_color: '#ff5200',
          background_color: '#ffffff',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          orientation: 'portrait',
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json,webmanifest}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          // Don't cache API or sitemap responses in the service worker
          navigateFallbackDenylist: [/^\/api/, /^\/sitemap\.xml/, /^\/robots\.txt/],
        },
      }),
    ],

    resolve: {
      alias: {
        '@/src':        path.resolve(__dirname, './frontend'),
        '@/components': path.resolve(__dirname, './frontend/components'),
        '@/lib':        path.resolve(__dirname, './frontend/lib'),
        '@':            path.resolve(__dirname, '.'),
      },
    },

    build: {
      // Surface real file sizes after gzip in terminal output
      reportCompressedSize: true,

      // Warn when any individual chunk exceeds 400 kB
      chunkSizeWarningLimit: 400,

      rollupOptions: {
        output: {
          /**
           * Manual chunk splitting strategy.
           * Each vendor group becomes its own hashed chunk so the browser
           * can cache them independently — updating app code never busts
           * the React or animation bundles.
           */
          manualChunks(id) {
            // Core React runtime
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')
            ) return 'react-core';

            // Routing
            if (
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/@remix-run/')
            ) return 'router';

            // Server-state / data fetching
            if (id.includes('node_modules/@tanstack/')) return 'query';

            // Animation — framer-motion and motion are the same lib
            if (
              id.includes('node_modules/framer-motion') ||
              id.includes('node_modules/motion')
            ) return 'motion';

            // Icons — large, gets its own chunk
            if (id.includes('node_modules/lucide-react')) return 'icons';

            // State management
            if (id.includes('node_modules/zustand')) return 'state';

            // Radix UI primitives + shadcn helpers
            if (
              id.includes('node_modules/@radix-ui/') ||
              id.includes('node_modules/class-variance-authority') ||
              id.includes('node_modules/clsx') ||
              id.includes('node_modules/tailwind-merge')
            ) return 'ui-vendor';

            // HTTP client + form utilities
            if (
              id.includes('node_modules/axios') ||
              id.includes('node_modules/react-hook-form') ||
              id.includes('node_modules/@hookform/') ||
              id.includes('node_modules/zod')
            ) return 'network-forms';

            // Everything else in node_modules
            if (id.includes('node_modules/')) return 'vendor-misc';
          },
        },
      },
    },

    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr:   process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
