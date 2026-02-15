"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative z-10 px-4 py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-xl mx-auto glass-hero rounded-2xl px-6 py-8 sm:px-10 sm:py-10 text-center"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-white/90">
          Ready to crop your collection?
        </h2>
        <p className="text-sm text-white/45 mt-2 max-w-sm mx-auto">
          Upload a scan. Get a perfectly cropped, oriented card image in seconds.
        </p>
        <div className="mt-6">
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
        </div>
      </motion.div>
    </section>
  );
}
