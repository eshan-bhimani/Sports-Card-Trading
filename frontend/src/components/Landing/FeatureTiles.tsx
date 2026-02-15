"use client";

import { motion } from "framer-motion";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18" />
        <path d="M15 3v18" />
        <path d="M3 9h18" />
        <path d="M3 15h18" />
      </svg>
    ),
    title: "PSA-Ready Framing",
    description:
      "Cards are automatically cropped to exact PSA Set Registry dimensions with precise border alignment.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        <path d="M21 3v5h-5" />
        <path d="M21 8l-4.35 3.26" />
      </svg>
    ),
    title: "Auto Orientation",
    description:
      "Smart rotation detection ensures every card is properly oriented — no manual adjustments needed.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    title: "Vault Format Export",
    description:
      "One-click export to Fanatics Vault format with optimized resolution and metadata intact.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const tileVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function FeatureTiles() {
  return (
    <section className="relative z-10 px-4 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-lg sm:text-xl font-bold text-white/90">
            Everything You Need
          </h2>
          <p className="text-xs sm:text-sm text-white/40 mt-1">
            Professional tools for serious collectors
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={tileVariants}
              className="glass-card rounded-xl p-5 sm:p-6 group hover:bg-white/[0.08] transition-colors duration-300"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-[#C8102E]/15 border border-[#C8102E]/20 flex items-center justify-center text-[#C8102E] mb-4 group-hover:bg-[#C8102E]/20 transition-colors duration-300">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-sm sm:text-base font-semibold text-white/90 mb-2">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-white/45 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
