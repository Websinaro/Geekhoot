import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Youtube, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#e0122a]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-14 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          {/* Brand */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block">
              <img
                src="/logo.png"
                alt="GeekHoot"
                className="h-10 w-auto object-contain dark:invert"
                draggable={false}
              />
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              Your one-stop shop for premium custom merchandise, personalised gifts, and unique accessories — delivered with care.
            </p>
            <div className="flex gap-3 pt-1">
              <a
                href="https://instagram.com/geekhoot.in"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 flex items-center justify-center text-gray-500 hover:bg-[#e0122a] hover:text-white hover:border-[#e0122a] transition-all duration-150 active:opacity-75 group"
              >
                <Instagram className="w-4 h-4 group-hover:text-white transition-colors" aria-hidden="true" />
              </a>
              <a
                href="https://facebook.com/geekhoot.in/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 flex items-center justify-center text-gray-500 hover:bg-[#e0122a] hover:text-white hover:border-[#e0122a] transition-all duration-150 active:opacity-75 group"
              >
                <Facebook className="w-4 h-4 group-hover:text-white transition-colors" aria-hidden="true" />
              </a>
              <a
                href="https://www.youtube.com/channel/UCs1tFdPhqfPN5-6sXpOAQrA"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 flex items-center justify-center text-gray-500 hover:bg-[#e0122a] hover:text-white hover:border-[#e0122a] transition-all duration-150 active:opacity-75 group"
              >
                <Youtube className="w-4 h-4 group-hover:text-white transition-colors" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide border-l-2 border-[#e0122a] pl-3">
              Shop
            </h3>
            <ul className="space-y-3">
              {[
                { to: '/products',                           label: 'All Products'    },
                { to: '/products?category=Electronics',     label: 'Electronics'     },
                { to: '/products?category=Accessories',     label: 'Accessories'     },
                { to: '/products?category=Wearables',       label: 'Wearable Gadgets'},
                { to: '/products?category=Custom Printing', label: 'Custom Printing' },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#e0122a] dark:hover:text-[#e0122a] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide border-l-2 border-[#e0122a] pl-3">
              Support
            </h3>
            <ul className="space-y-3">
              {[
                { to: '/profile',         label: 'My Profile'          },
                { to: '/orders',          label: 'Track My Order'      },
                { to: '/cart',            label: 'My Cart'             },
                { to: '/wishlist',        label: 'My Wishlist'         },
                { to: '/contact',         label: 'Contact Us'          },
                { to: '/faq',             label: 'FAQ'                 },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#e0122a] dark:hover:text-[#e0122a] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide border-l-2 border-[#e0122a] pl-3">
              Legal
            </h3>
            <ul className="space-y-3">
              {[
                { to: '/privacy-policy',  label: 'Privacy Policy'      },
                { to: '/terms',           label: 'Terms of Service'    },
                { to: '/shipping-policy', label: 'Shipping Policy'     },
                { to: '/refund-policy',   label: 'Return & Refund'     },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#e0122a] dark:hover:text-[#e0122a] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide border-l-2 border-[#e0122a] pl-3">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#e0122a] shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Kausthubham Pattara, Kurumpayam PO,<br />
                  Kallara, Thiruvananthapuram,<br />
                  Kerala — 695608
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#e0122a] shrink-0" aria-hidden="true" />
                <a
                  href="tel:+916238777570"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#e0122a] transition-colors"
                >
                  +91 62387 77570
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#e0122a] shrink-0" aria-hidden="true" />
                <a
                  href="mailto:mygeekhoot@gmail.com"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#e0122a] transition-colors"
                >
                  mygeekhoot@gmail.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} Geekhoot. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {[
              { to: '/privacy-policy',  label: 'Privacy Policy' },
              { to: '/terms',           label: 'Terms'          },
              { to: '/refund-policy',   label: 'Refunds'        },
              { to: '/contact',         label: 'Contact'        },
            ].map(({ to, label }) => (
              <Link key={to} to={to} className="text-xs text-gray-400 hover:text-[#e0122a] transition-colors">
                {label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Powered by{' '}
            <span className="text-[#e0122a] font-semibold">Websinaro</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
