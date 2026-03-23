"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroGlass() {
  return (
    <section className="px-4 pt-20 pb-16 sm:pt-28 sm:pb-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-xl mx-auto text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141416] border border-[#1e1e21] text-xs text-[#71717a] mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
          Built for serious collectors
        </motion.div>

        {/* Brand */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight text-[#fafafa]"
        >
          CollectHub
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-4 text-sm sm:text-base text-[#71717a] max-w-md mx-auto leading-relaxed"
        >
          Auto-crop &amp; orient your baseball cards for PSA Registry &amp;
          Fanatics Vault formats.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <Link
            href="/crop"
            className="btn-cta inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2v14a2 2 0 0 0 2 2h14" />
              <path d="M18 22V8a2 2 0 0 0-2-2H2" />
            </svg>
            Start Cropping
          </Link>
          <Link
            href="/auctions"
            className="btn-secondary inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm"
          >
            Browse Auctions
          </Link>
        </motion.div>

        {/* Subtle divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex items-center justify-center gap-3 text-[#3f3f46] text-xs"
        >
          <span className="w-8 h-px bg-[#27272a]" />
          <span>PSA &middot; Fanatics &middot; Vault</span>
          <span className="w-8 h-px bg-[#27272a]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
