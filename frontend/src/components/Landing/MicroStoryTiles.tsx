"use client";

import { motion } from "framer-motion";
import { Upload, Wand2, PackageCheck } from "lucide-react";

interface Step {
  number: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    number: "01",
    icon: <Upload size={22} strokeWidth={1.8} />,
    title: "Upload",
    body: "Snap or import any raw phone photo of your card.",
  },
  {
    number: "02",
    icon: <Wand2 size={22} strokeWidth={1.8} />,
    title: "Auto-Crop & Orient",
    body: "AI detects edges, corrects tilt, and frames it precisely.",
  },
  {
    number: "03",
    icon: <PackageCheck size={22} strokeWidth={1.8} />,
    title: "PSA/Vault Export",
    body: "Download a submission-ready file. Perfect framing, every time.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};

const tileVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function MicroStoryTiles() {
  return (
    <section className="relative z-10 px-4 py-6 sm:py-10">
      <div className="max-w-lg sm:max-w-3xl mx-auto">
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-center text-[11px] font-semibold text-white/30 tracking-widest uppercase mb-5"
        >
          How it works
        </motion.p>

        {/* Step tiles grid — stacked on mobile, row on sm+ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20px" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              variants={tileVariants}
              className="relative glass-card rounded-xl px-4 py-5 sm:px-5 sm:py-6 flex sm:flex-col items-start sm:items-start gap-4 sm:gap-3 group hover:bg-white/[0.07] transition-colors duration-300 overflow-hidden"
            >
              {/* Connector line — horizontal on mobile, hidden on desktop */}
              {i < STEPS.length - 1 && (
                <div
                  className="sm:hidden absolute right-0 top-1/2 w-px h-6 -translate-y-1/2"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)",
                  }}
                />
              )}

              {/* Icon + step badge */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white/60 group-hover:text-white/80 transition-colors duration-300"
                  style={{
                    background: "rgba(0,45,114,0.3)",
                    border: "1px solid rgba(0,61,165,0.3)",
                  }}
                >
                  {step.icon}
                </div>
                {/* Step number badge */}
                <div className="step-badge absolute -top-1.5 -right-1.5 text-[9px]">
                  {step.number}
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white/88 mb-1 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  {step.body}
                </p>
              </div>

              {/* Subtle top-right corner glow on hover */}
              <div
                className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(circle at top right, rgba(200,16,46,0.08), transparent 70%)",
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
