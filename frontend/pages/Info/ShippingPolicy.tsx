import React from 'react';
import { Truck } from 'lucide-react';

const stages = [
  { label: 'Order Confirmed',    days: 'Day 0',    desc: 'You receive an order confirmation email with your order ID.' },
  { label: 'Processing',         days: 'Day 1–2',  desc: 'Your order is reviewed and sent to production. Custom items are printed or prepared.' },
  { label: 'Quality Check',      days: 'Day 2–3',  desc: 'Each item is inspected for print quality and packaging.' },
  { label: 'Dispatched',         days: 'Day 3–5',  desc: 'Your order is handed to our courier partner. You receive a tracking link via email/SMS.' },
  { label: 'Out for Delivery',   days: 'Day 5–8',  desc: 'The courier is on its way to your address.' },
  { label: 'Delivered',          days: 'Day 5–10', desc: 'Your order arrives at your doorstep.' },
];

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#e0122a]/10 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-[#e0122a]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shipping & Delivery Policy</h1>
            <p className="text-xs text-gray-400 mt-0.5">Last updated: June 2025</p>
          </div>
        </div>

        <div className="space-y-6">

          {/* Timeline */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-8">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Delivery Timeline</h2>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-zinc-800" />
              <div className="space-y-6">
                {stages.map((stage, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="w-9 h-9 rounded-full bg-[#e0122a]/10 border-2 border-[#e0122a] flex items-center justify-center shrink-0 z-10">
                      <span className="text-[10px] font-bold text-[#e0122a]">{i + 1}</span>
                    </div>
                    <div className="pt-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{stage.label}</span>
                        <span className="text-xs bg-[#e0122a]/10 text-[#e0122a] px-2 py-0.5 rounded-full font-medium">{stage.days}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stage.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-8 space-y-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Shipping Coverage</h2>
              <p>We currently ship across India. We use trusted courier partners including Delhivery, Shiprocket, and India Post to ensure safe and timely delivery to all serviceable pin codes.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Shipping Charges</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Orders above ₹499 — <strong className="text-green-600 dark:text-green-400">FREE shipping</strong>.</li>
                <li>Orders below ₹499 — flat ₹49 shipping charge.</li>
                <li>Bulky or oversized items may incur additional charges displayed at checkout.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Custom & Personalised Items</h2>
              <p>
                Custom-printed products (mugs, T-shirts, photo frames, name slips, etc.) require 2–4 business days of production time before dispatch. This is included in the overall delivery estimate of <strong className="text-gray-700 dark:text-gray-300">5–10 business days</strong>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Order Tracking</h2>
              <p>
                Once your order is dispatched, you will receive a tracking number via email and/or SMS. You can also track your order from the <strong className="text-gray-700 dark:text-gray-300">My Orders</strong> section after logging in.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Delays & Exceptions</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Delivery timelines may be affected by public holidays, natural disasters, or courier disruptions.</li>
                <li>Remote or rural areas may take 2–3 additional business days.</li>
                <li>If your order hasn't arrived within 12 business days, please contact us.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Wrong Address</h2>
              <p>
                Please double-check your shipping address before placing the order. If an incorrect address is provided and the order is already dispatched, GeekHoot is not responsible for failed delivery. Re-shipping charges will apply.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Contact</h2>
              <p>For shipping queries, reach us at <a href="mailto:mygeekhoot@gmail.com" className="text-[#e0122a] hover:underline">mygeekhoot@gmail.com</a> or call <a href="tel:+916238777570" className="text-[#e0122a] hover:underline">+91 62387 77570</a>.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
