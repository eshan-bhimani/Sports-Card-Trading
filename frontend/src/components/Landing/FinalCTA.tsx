"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Crop, ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="relative z-10 px-4 py-6 pb-10 sm:py-12 sm:pb-14">
      {/* Glow divider */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="glow-divider" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md mx-auto text-center"
      >
        {/* Glass card */}
        <div
          className="rounded-2xl px-6 py-8 sm:px-8 sm:py-10 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(0,45,114,0.12) 100%)",
            border: "1px solid rgba(255,255,255,0.11)",
            boxShadow:
              "0 16px 48px rgba(0,0,0,0.4), 0 0 80px rgba(0,45,114,0.1), inset 0 1px 0 rgba(255,255,255,0.12)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {/* Top highlight */}
          <div
            className="absolute top-0 left-1/3 right-1/3 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
            }}
          />

          {/* Red accent glow top-right */}
          <div
            className="absolute -top-8 -right-8 w-32 h-32 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(200,16,46,0.12), transparent 70%)",
            }}
          />

          {/* Headline */}
          <h2 className="text-xl sm:text-2xl font-bold text-white/92 tracking-tight leading-snug">
            Ready to perfect your
            <br />
            <span
              style={{
                background:
                  "linear-gradient(135deg, #C8102E 0%, #ff3a58 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              card collection?
            </span>
          </h2>

          <p className="mt-2 text-sm text-white/38 max-w-xs mx-auto leading-relaxed">
            Upload a scan. Get a submission-ready image in seconds.
          </p>

          {/* CTA */}
          <div className="mt-6">
            <Link
              href="/crop"
              className="btn-cta btn-cta-pulse inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm sm:text-base font-semibold tracking-wide"
            >
              <Crop size={16} className="opacity-85" />
              Start Cropping
              <ArrowRight size={14} className="opacity-70" />
            </Link>
          </div>

          {/* Sub-trust line */}
          <p className="mt-4 text-[10px] text-white/20 tracking-wide">
            PSA Registry &middot; Fanatics Vault &middot; Free to use
          </p>
        </div>
      </motion.div>
    </section>
  );
}
