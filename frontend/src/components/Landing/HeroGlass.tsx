"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroGlass() {
  return (
    <section className="relative z-10 px-4 pt-16 pb-10 sm:pt-24 sm:pb-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="glass-hero rounded-2xl max-w-xl mx-auto px-6 py-10 sm:px-10 sm:py-14 text-center"
      >
        {/* Brand */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight"
        >
          <span className="text-white">Convention</span>
          <span className="bg-gradient-to-r from-[#C8102E] to-[#e8354a] bg-clip-text text-transparent">
            Connection
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-4 text-sm sm:text-base text-white/60 max-w-md mx-auto leading-relaxed"
        >
          Auto-crop &amp; orient your baseball cards for PSA Registry &amp;
          Fanatics Vault formats.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8"
        >
          <Link
            href="/crop"
            className="btn-cta inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm sm:text-base tracking-wide glass"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-80"
            >
              <path d="M6 2v14a2 2 0 0 0 2 2h14" />
              <path d="M18 22V8a2 2 0 0 0-2-2H2" />
            </svg>
            Start Cropping
          </Link>
        </motion.div>

        {/* Subtle decorative element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-8 flex items-center justify-center gap-3 text-white/25 text-xs"
        >
          <span className="w-8 h-px bg-white/15" />
          <span>PSA &middot; Fanatics &middot; Vault</span>
          <span className="w-8 h-px bg-white/15" />
        </motion.div>
      </motion.div>
    </section>
  );
}
