import React from 'react';
import { FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#ff5200]/10 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-[#ff5200]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
            <p className="text-xs text-gray-400 mt-0.5">Last updated: June 2025</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-8 space-y-8 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using <strong className="text-gray-700 dark:text-gray-300">mygeekhoot.onrender.com</strong>, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you must not use our website.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">2. Products & Custom Orders</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>All products listed are subject to availability. We reserve the right to limit quantities or discontinue any product at any time.</li>
              <li>Custom and personalised products are made-to-order. Once production begins, they cannot be cancelled or returned unless defective.</li>
              <li>Product images are for illustration purposes. Actual colours may vary slightly due to screen calibration and printing processes.</li>
              <li>We reserve the right to refuse orders containing offensive, copyrighted, or inappropriate custom content.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">3. Pricing & Payments</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>All prices are listed in Indian Rupees (₹) and include applicable taxes unless stated otherwise.</li>
              <li>We reserve the right to change prices at any time without prior notice. Orders already placed will be honoured at the price at the time of purchase.</li>
              <li>Payments are processed securely via Razorpay. We do not store your card details.</li>
              <li>In case of payment failure, your order will not be confirmed. Please retry or contact us.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">4. User Accounts</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must notify us immediately of any unauthorised use of your account.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
              <li>You must be at least 18 years old to create an account and make purchases.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">5. Intellectual Property</h2>
            <p>
              All content on this website — including logos, product images, text, and design — is the property of GeekHoot and protected under Indian copyright law. You may not reproduce, distribute, or use any content without our written permission. Custom designs submitted by customers remain their property; by submitting them you grant us a licence to reproduce them for order fulfilment only.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">6. Prohibited Activities</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Use the site for any unlawful purpose.</li>
              <li>Submit custom content that is obscene, hateful, defamatory, or infringes on third-party rights.</li>
              <li>Attempt to gain unauthorised access to our systems.</li>
              <li>Use automated tools to scrape, crawl, or abuse our services.</li>
              <li>Place fraudulent orders or engage in chargeback fraud.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">7. Limitation of Liability</h2>
            <p>
              GeekHoot shall not be liable for any indirect, incidental, or consequential damages arising from your use of the website or products. Our total liability for any claim shall not exceed the amount paid for the specific order in question.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">8. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Thiruvananthapuram, Kerala.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Updated terms will be posted on this page. Continued use of the site constitutes acceptance of the revised terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">10. Contact</h2>
            <p>
              For questions regarding these Terms, contact us at <a href="mailto:mygeekhoot@gmail.com" className="text-[#ff5200] hover:underline">mygeekhoot@gmail.com</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
