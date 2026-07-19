import React from 'react';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#e0122a]/10 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-[#e0122a]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
            <p className="text-xs text-gray-400 mt-0.5">Last updated: June 2025</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-8 space-y-8 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">1. Introduction</h2>
            <p>
              GeekHoot ("we", "us", or "our") operates the website <strong className="text-gray-700 dark:text-gray-300">mygeekhoot.onrender.com</strong>. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit or make a purchase from our website. Please read this policy carefully. By using our site, you agree to the practices described here.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">2. Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong className="text-gray-700 dark:text-gray-300">Personal Identifiers:</strong> Name, email address, phone number, and shipping address when you create an account or place an order.</li>
              <li><strong className="text-gray-700 dark:text-gray-300">Payment Information:</strong> We do not store full card details. Payments are processed by third-party gateways (Razorpay) under their own privacy policies.</li>
              <li><strong className="text-gray-700 dark:text-gray-300">Usage Data:</strong> Pages visited, time spent, browser type, device type, and IP address collected automatically via cookies and analytics tools.</li>
              <li><strong className="text-gray-700 dark:text-gray-300">Communications:</strong> Messages or emails you send us for support.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To process and fulfil your orders and send order confirmations.</li>
              <li>To send shipping and delivery updates.</li>
              <li>To respond to customer support queries.</li>
              <li>To improve our website, products, and services.</li>
              <li>To send promotional emails if you have opted in (you may unsubscribe at any time).</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">4. Sharing Your Information</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share data with:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong className="text-gray-700 dark:text-gray-300">Shipping partners</strong> (e.g., courier services) to deliver your orders.</li>
              <li><strong className="text-gray-700 dark:text-gray-300">Payment gateways</strong> (Razorpay) to process transactions securely.</li>
              <li><strong className="text-gray-700 dark:text-gray-300">Analytics providers</strong> (e.g., Google Analytics) to help us understand website usage — data is anonymised.</li>
              <li><strong className="text-gray-700 dark:text-gray-300">Legal authorities</strong> when required by law.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">5. Cookies</h2>
            <p>
              We use cookies to maintain your session, remember your cart, and analyse traffic. You can disable cookies in your browser settings, though some features may not work correctly. We also use Google AdSense which may place its own cookies for advertising personalisation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">6. Data Security</h2>
            <p>
              We implement industry-standard security measures including HTTPS encryption, hashed passwords, and restricted database access. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Opt out of marketing communications at any time.</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, email us at <a href="mailto:mygeekhoot@gmail.com" className="text-[#e0122a] hover:underline">mygeekhoot@gmail.com</a>.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">8. Third-Party Links</h2>
            <p>Our website may contain links to third-party sites. We are not responsible for their privacy practices and encourage you to review their policies separately.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">9. Children's Privacy</h2>
            <p>Our services are not directed to children under 13. We do not knowingly collect personal data from children. If you believe we have inadvertently collected such data, please contact us immediately.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of the site after changes constitutes acceptance.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">11. Contact</h2>
            <p>For any privacy-related questions, contact us at <a href="mailto:mygeekhoot@gmail.com" className="text-[#e0122a] hover:underline">mygeekhoot@gmail.com</a> or call <a href="tel:+916238777570" className="text-[#e0122a] hover:underline">+91 62387 77570</a>.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
