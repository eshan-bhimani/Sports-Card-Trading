"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="px-4 py-16 border-t border-[#1e1e21]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="max-w-xl mx-auto text-center"
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-[#fafafa]">
          Ready to crop your collection?
        </h2>
        <p className="text-sm text-[#71717a] mt-2 max-w-sm mx-auto">
          Upload a scan. Get a perfectly cropped, oriented card image in seconds.
        </p>
        <div className="mt-6">
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
        </div>
      </motion.div>
    </section>
  );
}
