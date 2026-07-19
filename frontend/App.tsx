import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from './providers/QueryProvider';
import { useAuthStore } from './store/authStore';
import { useWishlistStore } from './store/wishlistStore';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import SplashScreen from './components/common/SplashScreen';
import { ThemeProvider } from './components/common/ThemeProvider';
import { PageSkeleton } from './components/common/Skeleton';

// ── User-facing pages (lazy) ──────────────────────────────────────────────────
const Home          = React.lazy(() => import('./pages/Home'));
const Login         = React.lazy(() => import('./pages/Auth/Login'));
const Signup        = React.lazy(() => import('./pages/Auth/Signup'));
const ProductList   = React.lazy(() => import('./pages/Product/ProductList'));
const ProductDetail = React.lazy(() => import('./pages/Product/ProductDetail'));
const Cart          = React.lazy(() => import('./pages/Cart/Cart'));
const Wishlist      = React.lazy(() => import('./pages/User/Wishlist'));
const Profile       = React.lazy(() => import('./pages/User/Profile'));
const Orders        = React.lazy(() => import('./pages/User/Orders'));
const PrivacyPolicy = React.lazy(() => import('./pages/Info/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./pages/Info/TermsOfService'));
const ShippingPolicy = React.lazy(() => import('./pages/Info/ShippingPolicy'));
const RefundPolicy  = React.lazy(() => import('./pages/Info/RefundPolicy'));
const ContactUs     = React.lazy(() => import('./pages/Info/ContactUs'));

// ── Admin pages (separate lazy group — never bundled into user sessions) ──────
const AdminDashboard = React.lazy(() => import('./pages/Admin/Dashboard'));

// ── Lightweight admin skeleton ────────────────────────────────────────────────
function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-[#e0122a] border-t-transparent animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Loading admin panel…</p>
      </div>
    </div>
  );
}

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (adminOnly && user?.role !== 'ADMIN') return <Navigate to="/" />;
  return <>{children}</>;
};

function AppRoutes() {
  const { isAuthenticated } = useAuthStore();
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
  const location = useLocation();

  React.useEffect(() => {
    if (isAuthenticated) fetchWishlist();
  }, [isAuthenticated, fetchWishlist]);

  React.useEffect(() => {
    const getPageTitle = (path: string) => {
      if (path === '/')                 return 'Geekhoot — Premium Custom Merch';
      if (path.startsWith('/login'))    return 'Login — Geekhoot';
      if (path.startsWith('/signup'))   return 'Create Account — Geekhoot';
      if (path.startsWith('/products')) return 'Shop All Products — Geekhoot';
      if (path.startsWith('/product/')) return 'Product Details — Geekhoot';
      if (path.startsWith('/cart'))     return 'My Cart — Geekhoot';
      if (path.startsWith('/wishlist')) return 'My Wishlist — Geekhoot';
      if (path.startsWith('/profile'))  return 'My Profile — Geekhoot';
      if (path.startsWith('/orders'))   return 'My Orders — Geekhoot';
      if (path.startsWith('/privacy-policy'))  return 'Privacy Policy — Geekhoot';
      if (path.startsWith('/terms'))           return 'Terms of Service — Geekhoot';
      if (path.startsWith('/shipping-policy')) return 'Shipping Policy — Geekhoot';
      if (path.startsWith('/refund-policy'))   return 'Refund Policy — Geekhoot';
      if (path.startsWith('/contact'))         return 'Contact Us — Geekhoot';
      if (path.startsWith('/admin'))    return 'Admin Panel — Geekhoot';
      return 'Geekhoot — Premium Custom Merch';
    };
    document.title = getPageTitle(location.pathname);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-[#e0122a]/20 selection:text-[#e0122a] transition-colors duration-200">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* ── User routes — shared Suspense boundary ───────────────────── */}
          <Route path="/*" element={
            <React.Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/"            element={<Home />} />
                <Route path="/login"       element={<Login />} />
                <Route path="/signup"      element={<Signup />} />
                <Route path="/products"    element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart"        element={<Cart />} />
                <Route path="/wishlist"    element={<Wishlist />} />
                <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/orders"      element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/privacy-policy"   element={<PrivacyPolicy />} />
                <Route path="/terms"            element={<TermsOfService />} />
                <Route path="/shipping-policy"  element={<ShippingPolicy />} />
                <Route path="/refund-policy"    element={<RefundPolicy />} />
                <Route path="/contact"          element={<ContactUs />} />
              </Routes>
            </React.Suspense>
          } />

          {/* ── Admin routes — isolated Suspense, never loaded for users ─── */}
          <Route path="/admin/*" element={
            <ProtectedRoute adminOnly>
              <React.Suspense fallback={<AdminSkeleton />}>
                <AdminDashboard />
              </React.Suspense>
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = React.useState(true);

  return (
    <ThemeProvider>
      <QueryProvider>
        <Router>
          {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
          <AppRoutes />
          <Toaster richColors position="top-center" />
        </Router>
      </QueryProvider>
    </ThemeProvider>
  );
}
