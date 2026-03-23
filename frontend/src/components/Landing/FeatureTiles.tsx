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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
      staggerChildren: 0.08,
    },
  },
};

const tileVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

export default function FeatureTiles() {
  return (
    <section className="px-4 py-16 border-t border-[#1e1e21]">
      <div className="max-w-4xl mx-auto">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-[#fafafa]">
            Everything You Need
          </h2>
          <p className="text-sm text-[#71717a] mt-1">
            Professional tools for serious collectors
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={tileVariants}
              className="surface-interactive rounded-lg p-5 group"
            >
              {/* Icon */}
              <div className="w-8 h-8 rounded-md bg-[#1c1c1f] border border-[#27272a] flex items-center justify-center text-[#8b5cf6] mb-3">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-sm font-medium text-[#fafafa] mb-1.5">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-[#52525b] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
