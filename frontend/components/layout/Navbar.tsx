import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, LogOut, Package, LayoutDashboard, Bell, Sun, Moon, Laptop, Sparkles, Check, Heart } from 'lucide-react';
import { useAuthStore } from '@/src/store/authStore';
import { useCartStore } from '@/src/store/cartStore';
import { useWishlistStore } from '@/src/store/wishlistStore';
import { useTheme } from '@/src/components/common/ThemeProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import api from '@/src/services/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  productId?: string;
  read: boolean;
  createdAt: string;
}

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const totalItems = useCartStore((state) => state.totalItems());
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
    }
  };

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await api.get('/notifications');
      return data;
    },
    enabled: !!user,
    refetchInterval: 15000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(`/notifications/${id}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) await markAsReadMutation.mutateAsync(notif.id);
    if (notif.productId) navigate(`/product/${notif.productId}`);
  };

  const themeLabel = theme === 'light' ? 'Light theme active' : theme === 'dark' ? 'Dark theme active' : 'System theme active';

  return (
    <nav className="sticky top-0 z-50 w-full bg-white dark:bg-zinc-950 text-black dark:text-white border-b border-gray-100 dark:border-zinc-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center gap-6">

          {/* Logo + Title */}
          <div className="flex items-center shrink-0">
            <Link to="/" aria-label="Geekhoot — go to homepage" className="flex items-center gap-2 group">
              <img
                src="/logo.png"
                alt=""
                className="h-8 w-8 object-contain dark:invert transition-opacity group-hover:opacity-80"
                draggable={false}
              />
              <span style={{ fontFamily: 'var(--font-heading)' }} className="text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-[#e0122a] transition-colors">
                Geek<span className="text-[#e0122a] group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Hoot</span>
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearch} role="search" className="relative w-full group">
              <Input
                type="search"
                placeholder="Search for products, brands and more"
                aria-label="Search products"
                className="w-full h-10 pl-10 pr-4 bg-[#f4f4f5] dark:bg-zinc-900 border-none focus-visible:ring-1 focus-visible:ring-red-500 text-sm text-gray-900 dark:text-white rounded-full shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">

            {/* Theme Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={themeLabel + ' — click to change theme'}
                className="p-2 rounded-full hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all cursor-pointer text-gray-600 dark:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                {theme === 'light'  && <Sun    className="w-5 h-5 text-amber-500"  aria-hidden="true" />}
                {theme === 'dark'   && <Moon   className="w-5 h-5 text-indigo-400" aria-hidden="true" />}
                {theme === 'system' && <Laptop className="w-5 h-5 text-gray-500"   aria-hidden="true" />}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 bg-white dark:bg-zinc-950 border-gray-100 dark:border-zinc-900 shadow-xl rounded-md">
                {/* upgraded text-gray-400 → text-gray-600 */}
                <DropdownMenuLabel className="text-xs font-bold text-gray-600">Theme Preference</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-100 dark:bg-zinc-900" />
                <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer text-sm font-semibold flex items-center justify-between dark:hover:bg-zinc-900 focus:bg-gray-50 dark:focus:bg-zinc-900">
                  <span className="flex items-center gap-2"><Sun  className="w-4 h-4 text-amber-500"  aria-hidden="true" /> Light</span>
                  {theme === 'light'  && <Check className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer text-sm font-semibold flex items-center justify-between dark:hover:bg-zinc-900 focus:bg-gray-50 dark:focus:bg-zinc-900">
                  <span className="flex items-center gap-2"><Moon className="w-4 h-4 text-indigo-400" aria-hidden="true" /> Dark</span>
                  {theme === 'dark'   && <Check className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer text-sm font-semibold flex items-center justify-between dark:hover:bg-zinc-900 focus:bg-gray-50 dark:focus:bg-zinc-900">
                  <span className="flex items-center gap-2"><Laptop className="w-4 h-4 text-gray-500" aria-hidden="true" /> System</span>
                  {theme === 'system' && <Check className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
                  className="relative p-2 rounded-full hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all cursor-pointer text-gray-600 dark:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <Bell className="w-5 h-5" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span aria-hidden="true" className="absolute top-1.5 right-1.5 bg-red-500 text-white min-w-[15px] h-[15px] px-1 flex items-center justify-center text-[9px] font-bold rounded-full animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[360px] max-h-[480px] overflow-y-auto bg-white dark:bg-zinc-950 border-gray-100 dark:border-zinc-900 shadow-xl rounded-md p-0">
                  <div className="p-4 border-b border-gray-100 dark:border-zinc-900 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">Store Notifications</h3>
                    <span className="text-[11px] bg-red-50 dark:bg-red-950/40 text-[#e0122a] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      {unreadCount} New
                    </span>
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-zinc-900/60 max-h-[350px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleNotificationClick(notif)}
                          onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(notif)}
                          aria-label={`${notif.read ? '' : 'Unread: '}${notif.title}`}
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-zinc-900/40 cursor-pointer transition-colors relative flex gap-3 ${!notif.read ? 'bg-red-50/20 dark:bg-zinc-900/30' : ''}`}
                        >
                          <div className="shrink-0 w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-[#e0122a]" aria-hidden="true" />
                          </div>
                          <div className="space-y-1 w-full pr-4">
                            <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug">{notif.title}</p>
                            {/* text-gray-500 passes WCAG AA on white (4.6:1) */}
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{notif.message}</p>
                            <p className="text-[10px] text-gray-500 font-medium">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {!notif.read && (
                            <span aria-hidden="true" className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#e0122a]" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-gray-500 dark:text-gray-400 space-y-2">
                        <Bell className="w-8 h-8 mx-auto stroke-1" aria-hidden="true" />
                        <p className="text-xs italic">No announcements yet</p>
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={`Account menu for ${user.name}`}
                  className="flex items-center gap-2 font-semibold text-sm hover:text-[#e0122a] dark:text-white dark:hover:text-[#e0122a] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                >
                  <span>{user.name}</span>
                  <Menu className="w-4 h-4" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] bg-white dark:bg-zinc-950 border-gray-100 dark:border-zinc-900 shadow-xl rounded-md p-1">
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded h-10 cursor-pointer text-sm font-semibold flex items-center gap-2 px-3 hover:bg-gray-50 dark:hover:bg-zinc-900">
                    <User className="h-4 w-4 text-gray-500" aria-hidden="true" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')} className="rounded h-10 cursor-pointer text-sm font-semibold flex items-center gap-2 px-3 hover:bg-gray-50 dark:hover:bg-zinc-900">
                    <Package className="h-4 w-4 text-gray-500" aria-hidden="true" /> My Orders
                  </DropdownMenuItem>
                  {user.role === 'ADMIN' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="rounded h-10 cursor-pointer text-sm font-bold flex items-center gap-2 px-3 text-[#e0122a] hover:bg-red-50 dark:hover:bg-zinc-900">
                      <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-gray-100 dark:bg-zinc-900" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded h-10 cursor-pointer text-sm font-semibold flex items-center gap-2 px-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                    <LogOut className="h-4 w-4" aria-hidden="true" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                className="bg-[#e0122a] text-white hover:bg-[#0b0b0d] rounded-full px-8 h-9 font-bold text-sm shadow-sm border-none cursor-pointer"
              >
                Login
              </Button>
            )}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label={wishlistCount > 0 ? `Wishlist — ${wishlistCount} item${wishlistCount !== 1 ? 's' : ''}` : 'Wishlist'}
              className="flex items-center gap-2 hover:text-[#e0122a] transition-colors"
            >
              <div className="relative">
                <Heart className="w-5 h-5 text-gray-600 dark:text-gray-300" aria-hidden="true" />
                {wishlistCount > 0 && (
                  <span aria-hidden="true" className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[16px] h-[16px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Wishlist</span>
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              aria-label={totalItems > 0 ? `Cart — ${totalItems} item${totalItems !== 1 ? 's' : ''}` : 'Cart'}
              className="flex items-center gap-2 hover:text-[#e0122a] transition-colors"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-300" aria-hidden="true" />
                {totalItems > 0 && (
                  <span aria-hidden="true" className="absolute -top-2 -right-2 bg-[#e0122a] text-white min-w-[16px] h-[16px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Cart</span>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-4">

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-1.5 rounded-full text-gray-600 dark:text-gray-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500 focus:outline-none"
            >
              {theme === 'dark'
                ? <Sun  className="w-5 h-5 text-amber-500" aria-hidden="true" />
                : <Moon className="w-5 h-5 text-gray-600"  aria-hidden="true" />}
            </button>

            <Link
              to="/wishlist"
              aria-label={wishlistCount > 0 ? `Wishlist — ${wishlistCount} item${wishlistCount !== 1 ? 's' : ''}` : 'Wishlist'}
              className="relative w-8 h-8 flex items-center justify-center"
            >
              <Heart className="w-6 h-6 text-gray-700 dark:text-gray-300" aria-hidden="true" />
              {wishlistCount > 0 && (
                <span aria-hidden="true" className="absolute -top-1 -right-1 bg-red-500 text-white min-w-[16px] h-[16px] flex items-center justify-center text-[10px] font-bold rounded-full animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              aria-label={totalItems > 0 ? `Cart — ${totalItems} item${totalItems !== 1 ? 's' : ''}` : 'Cart'}
              className="relative w-8 h-8 flex items-center justify-center"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300" aria-hidden="true" />
              {totalItems > 0 && (
                <span aria-hidden="true" className="absolute -top-1 -right-1 bg-[#e0122a] text-white min-w-[16px] h-[16px] flex items-center justify-center text-[10px] font-bold rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            <Sheet>
              <SheetTrigger aria-label="Open navigation menu" className="p-1 focus-visible:ring-2 focus-visible:ring-red-500 focus:outline-none rounded">
                <Menu className="w-7 h-7 text-gray-700 dark:text-gray-300" aria-hidden="true" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] p-0 border-none bg-white dark:bg-zinc-950 text-black dark:text-white">
                <div className="p-6 space-y-8 h-full flex flex-col">
                  <div className="flex items-center gap-2">
                    <img
                      src="/logo.png"
                      alt=""
                      className="h-8 w-8 object-contain dark:invert"
                      draggable={false}
                    />
                    <span style={{ fontFamily: 'var(--font-heading)' }} className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                      Geek<span className="text-[#e0122a]">Hoot</span>
                    </span>
                  </div>

                  <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
                    {[
                      { to: '/',         icon: LayoutDashboard, label: 'Home' },
                      { to: '/products', icon: Search,          label: 'All Categories' },
                      { to: '/wishlist', icon: Heart,           label: 'Wishlist' },
                      { to: '/profile',  icon: User,            label: 'Account' },
                      { to: '/orders',   icon: Package,         label: 'Orders' },
                    ].map((item) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        className="flex items-center gap-4 p-3.5 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-md transition-all group"
                      >
                        <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                        <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{item.label}</span>
                      </Link>
                    ))}
                  </nav>

                  {user?.role === 'ADMIN' && (
                    <Link to="/admin" className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-md flex items-center gap-4 text-[#e0122a]">
                      <LayoutDashboard className="w-5 h-5" aria-hidden="true" />
                      <span className="font-bold text-sm">Admin Panel</span>
                    </Link>
                  )}

                  {user && notifications.length > 0 && (
                    <div className="border-t border-gray-100 dark:border-zinc-900 pt-4 space-y-2">
                      {/* upgraded text-gray-400 → text-gray-600 */}
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider px-3">Recent Announcements ({unreadCount})</p>
                      <div className="max-h-40 overflow-y-auto space-y-2 px-1">
                        {notifications.slice(0, 3).map((notif) => (
                          <div
                            key={notif.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleNotificationClick(notif)}
                            onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick(notif)}
                            aria-label={`${notif.read ? '' : 'Unread: '}${notif.title}`}
                            className="p-2.5 rounded bg-gray-50 dark:bg-zinc-900/60 border border-transparent text-xs hover:border-[#e0122a]/30 transition-colors cursor-pointer"
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-gray-800 dark:text-white line-clamp-1">{notif.title}</span>
                              {!notif.read && <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-red-500 block" />}
                            </div>
                            <span className="block text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{notif.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-6 border-t border-gray-100 dark:border-zinc-900">
                    {user ? (
                      <Button
                        onClick={handleLogout}
                        variant="ghost"
                        className="w-full h-12 rounded-md font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border-none"
                      >
                        Logout
                      </Button>
                    ) : (
                      <Button
                        onClick={() => navigate('/login')}
                        className="w-full h-12 rounded-md bg-[#0b0b0d] text-white font-bold text-sm border-none"
                      >
                        Login / Sign Up
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
