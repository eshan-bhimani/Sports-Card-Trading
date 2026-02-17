"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Crop, CheckCircle2, ArrowRight } from "lucide-react";

export default function HeroProductPanel() {
  return (
    <section className="relative z-10 px-4 pt-14 pb-6 sm:pt-20 sm:pb-10">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel rounded-2xl max-w-lg mx-auto px-5 py-8 sm:px-8 sm:py-11 text-center relative overflow-hidden"
      >
        {/* Top highlight line */}
        <div
          className="absolute top-0 left-1/4 right-1/4 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
          }}
        />

        {/* Subtle inner glow at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,45,114,0.1), transparent)",
          }}
        />

        {/* Label chip */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.4 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-5"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#C8102E]"
            style={{ animation: "pulse 2s ease-in-out infinite" }}
          />
          <span className="text-[10px] font-semibold text-white/45 tracking-widest uppercase">
            Card Intelligence
          </span>
          <Sparkles size={10} className="text-white/30" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[2.6rem] sm:text-5xl font-black tracking-[-0.02em] leading-[1.05]"
        >
          <span className="text-white">Convention</span>
          <br />
          <span
            style={{
              background:
                "linear-gradient(135deg, #C8102E 0%, #ff3a58 60%, #ff6070 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Connection
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="mt-3 text-sm sm:text-[15px] text-white/50 max-w-[260px] mx-auto leading-relaxed"
        >
          Snap a photo. Get a PSA-ready card in seconds.
        </motion.p>

        {/* ── Product preview strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.46 }}
          className="mt-6 flex items-center justify-center gap-3"
        >
          {/* Raw photo thumbnail */}
          <div
            className="relative flex flex-col items-center justify-end rounded-lg overflow-hidden"
            style={{
              width: 72,
              height: 96,
              background:
                "linear-gradient(145deg, #1a2a45 0%, #0f1c32 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              transform: "rotate(-3deg)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            {/* Blurry card silhouette */}
            <div
              className="absolute inset-2 rounded opacity-30"
              style={{
                background:
                  "linear-gradient(160deg, rgba(255,255,255,0.15) 0%, transparent 80%)",
                filter: "blur(2px)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-8 h-10 rounded-sm opacity-25"
                style={{
                  background: "rgba(255,255,255,0.3)",
                  transform: "rotate(6deg)",
                  filter: "blur(1px)",
                }}
              />
            </div>
            <div
              className="relative z-10 w-full px-1.5 pb-1.5 pt-4"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
              }}
            >
              <p className="text-[8px] text-white/40 text-center font-medium">
                Raw Scan
              </p>
            </div>
          </div>

          {/* Arrow + magic spark */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-[10px] text-[#C8102E] font-bold">AI</div>
            <div className="flex items-center gap-0.5">
              <div
                className="h-px w-4"
                style={{ background: "rgba(200,16,46,0.4)" }}
              />
              <ArrowRight size={12} className="text-[#C8102E]" />
            </div>
          </div>

          {/* PSA-ready thumbnail */}
          <div
            className="relative flex flex-col items-center justify-end rounded-lg overflow-hidden"
            style={{
              width: 72,
              height: 96,
              background:
                "linear-gradient(145deg, #003DA5 0%, #002260 100%)",
              border: "1px solid rgba(0,61,165,0.5)",
              boxShadow:
                "0 4px 24px rgba(0,45,114,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            {/* Clean card surface */}
            <div
              className="absolute inset-1.5 rounded opacity-20"
              style={{
                background:
                  "linear-gradient(160deg, rgba(255,255,255,0.25) 0%, transparent 60%)",
              }}
            />
            {/* Perfect alignment guides */}
            <div
              className="absolute inset-2 rounded-sm"
              style={{ border: "1px dashed rgba(255,255,255,0.15)" }}
            />
            {/* Center crop icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Crop size={18} className="text-white/35" />
            </div>
            {/* Check badge */}
            <div className="absolute top-2 right-2">
              <CheckCircle2 size={12} className="text-[#4ade80]" />
            </div>
            <div
              className="relative z-10 w-full px-1.5 pb-1.5 pt-4"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
              }}
            >
              <p className="text-[8px] text-white/60 text-center font-semibold">
                PSA-Ready
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-7"
        >
          <Link
            href="/crop"
            className="btn-cta btn-cta-pulse inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm sm:text-base font-semibold tracking-wide"
          >
            <Crop size={16} className="opacity-85" />
            Start Cropping
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.78 }}
          className="mt-4 text-[11px] text-white/22 tracking-wide"
        >
          Built for PSA Registry &middot; Fanatics Vault formats
        </motion.p>
      </motion.div>
    </section>
  );
}
