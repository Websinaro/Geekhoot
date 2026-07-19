import React from 'react';
import { RefreshCw } from 'lucide-react';

const steps = [
  { step: '1', title: 'Contact Us',       desc: 'Email mygeekhoot@gmail.com within 7 days of delivery. Include your order ID and photos of the issue.' },
  { step: '2', title: 'Review',           desc: 'Our team reviews your request within 1–2 business days and confirms eligibility.' },
  { step: '3', title: 'Return / Replace', desc: 'If approved, we arrange pickup (where available) or ask you to ship the item back.' },
  { step: '4', title: 'Refund / Resend',  desc: 'Refund is processed to your original payment method within 5–7 business days, or a replacement is dispatched.' },
];

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#e0122a]/10 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 text-[#e0122a]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Return & Refund Policy</h1>
            <p className="text-xs text-gray-400 mt-0.5">Last updated: June 2025</p>
          </div>
        </div>

        <div className="space-y-6">

          {/* Quick summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Return Window',    value: '7 days',        sub: 'from delivery date'   },
              { label: 'Refund Timeline',  value: '5–7 days',      sub: 'after approval'        },
              { label: 'Exchange',         value: 'Available',     sub: 'for eligible items'    },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-5 text-center">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="text-xl font-bold text-[#e0122a]">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Process */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-8">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-6">How to Return / Refund</h2>
            <div className="space-y-5">
              {steps.map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#e0122a] flex items-center justify-center shrink-0 text-white text-xs font-bold">{step}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Policy details */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-8 space-y-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Eligible for Return / Refund</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Item received is damaged, broken, or defective.</li>
                <li>Wrong item delivered (different product or size).</li>
                <li>Item has a significant print quality defect (blurred, misaligned, faded).</li>
                <li>Item is missing from the order (partial delivery).</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Not Eligible for Return</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Custom/personalised items — unless defective or incorrect.</li>
                <li>Items returned without original packaging.</li>
                <li>Items showing signs of use, washing, or damage caused by the customer.</li>
                <li>Return requests made after 7 days of delivery.</li>
                <li>Change of mind or incorrect size ordered by the customer.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Refund Method</h2>
              <p>Approved refunds are credited to your original payment method:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong className="text-gray-700 dark:text-gray-300">UPI / Net Banking / Debit Card:</strong> 5–7 business days.</li>
                <li><strong className="text-gray-700 dark:text-gray-300">Credit Card:</strong> 7–10 business days (depending on your bank).</li>
                <li><strong className="text-gray-700 dark:text-gray-300">Wallet / Store Credit:</strong> Instant, if chosen.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Exchange Policy</h2>
              <p>We offer free size exchanges for T-shirts and wearables if the item is unused and in original packaging. Contact us within 7 days of delivery to initiate an exchange.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Cancellations</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Orders can be cancelled within <strong className="text-gray-700 dark:text-gray-300">24 hours</strong> of placing, provided production has not started.</li>
                <li>Once production begins (especially for custom items), cancellation is not possible.</li>
                <li>To cancel, email us immediately at <a href="mailto:mygeekhoot@gmail.com" className="text-[#e0122a] hover:underline">mygeekhoot@gmail.com</a> with your order ID.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Contact for Returns</h2>
              <p>
                Email: <a href="mailto:mygeekhoot@gmail.com" className="text-[#e0122a] hover:underline">mygeekhoot@gmail.com</a><br />
                Phone: <a href="tel:+916238777570" className="text-[#e0122a] hover:underline">+91 62387 77570</a><br />
                Address: Kausthubham Pattara, Kurumpayam PO, Kallara, Thiruvananthapuram, Kerala — 695608
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
