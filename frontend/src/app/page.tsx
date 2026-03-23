"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import HeroGlass from "@/components/Landing/HeroGlass";
import CardShowcaseSlider from "@/components/Landing/CardShowcaseSlider";
import FeatureTiles from "@/components/Landing/FeatureTiles";
import CTASection from "@/components/Landing/CTASection";

export default function Home() {
  return (
    <div className="min-h-dvh bg-[#09090b]">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="px-4 pt-5 border-b border-[#1e1e21]"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between pb-4">
          <span className="text-sm font-semibold tracking-tight text-[#fafafa]">
            CollectHub
          </span>
          <div className="flex items-center gap-6">
            <Link href="/crop" className="nav-link text-sm">
              Crop Tool
            </Link>
            <Link href="/auctions" className="nav-link text-sm">
              Auctions
            </Link>
            <Link href="/collection" className="nav-link text-sm">
              Collection
            </Link>
            <Link href="/wants" className="nav-link text-sm">
              Wants
            </Link>
            <Link href="/settings/pricing" className="nav-link text-sm">
              Pricing
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <HeroGlass />

      {/* Card showcase slider */}
      <CardShowcaseSlider />

      {/* Feature tiles */}
      <FeatureTiles />

      {/* Auctions Preview Section */}
      <section className="px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-[#fafafa]">
              Auction Intelligence
            </h2>
            <p className="text-sm text-[#71717a] mt-1">
              Track prices and bid on cards across Fanatics, Goldin &amp; PWCC
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
                title: "Live Price Tracking",
                description:
                  "Monitor real-time auction prices across multiple platforms with instant alerts.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                ),
                title: "Smart Bidding",
                description:
                  "Set maximum bids and let our system automatically compete for you at the best price.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20V10" />
                    <path d="M18 20V4" />
                    <path d="M6 20v-4" />
                  </svg>
                ),
                title: "Market Analytics",
                description:
                  "Historical price data and trend analysis to inform your collecting strategy.",
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="surface-interactive rounded-lg p-5 group"
              >
                <div className="w-8 h-8 rounded-md bg-[#1c1c1f] border border-[#27272a] flex items-center justify-center text-[#8b5cf6] mb-3">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-medium text-[#fafafa] mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-xs text-[#52525b] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/auctions"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium btn-secondary"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Browse Live Auctions
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <CTASection />

      {/* Footer */}
      <footer className="px-4 pb-8 pt-4 border-t border-[#1e1e21]">
        <p className="text-center text-[#3f3f46] text-xs">
          CollectHub &middot; Baseball Card Tools
        </p>
      </footer>
    </div>
  );
}
