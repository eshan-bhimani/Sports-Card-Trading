"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  type PricingStrategy,
  type PriceSource,
  loadStrategy,
  saveStrategy,
  PLATFORM_LIST,
} from "@/lib/pricingStrategy";

export default function PricingSettingsPage() {
  const [strategy, setStrategy] = useState<PricingStrategy>({
    enabled: true,
    bidThresholdPercent: 0,
    priceSource: "VCP",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setStrategy(loadStrategy());
  }, []);

  const handleSave = () => {
    saveStrategy(strategy);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const thresholdLabel =
    strategy.bidThresholdPercent === 0
      ? "At market average"
      : strategy.bidThresholdPercent > 0
        ? `${strategy.bidThresholdPercent}% above market`
        : `${Math.abs(strategy.bidThresholdPercent)}% below market`;

  return (
    <div className="min-h-dvh flex flex-col bg-[#09090b]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="px-4 pt-6 pb-4 border-b border-[#1e1e21]"
      >
        <div className="max-w-xl mx-auto">
          <Link
            href="/auctions"
            className="inline-flex items-center gap-1.5 text-[#52525b] hover:text-[#a1a1aa] transition-colors text-sm mb-3 group"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform duration-150">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Auctions
          </Link>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#fafafa]">
            Pricing Strategy
          </h1>
          <p className="text-[#52525b] text-sm mt-1">
            Configure how much you&apos;re willing to pay relative to market
            averages
          </p>
        </div>
      </motion.header>

      <main className="flex-1 px-4 py-6">
        <div className="max-w-xl mx-auto space-y-4">
          {/* Enable/Disable Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="surface rounded-lg p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-[#fafafa]">
                  Strategy Status
                </h2>
                <p className="text-xs text-[#52525b] mt-0.5">
                  Enable to evaluate bids against market prices
                </p>
              </div>
              <button
                onClick={() =>
                  setStrategy((s) => ({ ...s, enabled: !s.enabled }))
                }
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  strategy.enabled
                    ? "bg-[#8b5cf6]"
                    : "bg-[#27272a]"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 ${
                    strategy.enabled
                      ? "left-[22px] bg-white"
                      : "left-0.5 bg-[#52525b]"
                  }`}
                />
              </button>
            </div>
          </motion.div>

          {/* Bid Threshold Slider */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="surface rounded-lg p-5"
          >
            <h2 className="text-sm font-medium text-[#fafafa] mb-1">
              Bid Threshold
            </h2>
            <p className="text-xs text-[#52525b] mb-4">
              How far from the average market price you&apos;re willing to pay
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#3f3f46]">-30%</span>
                <span
                  className={`text-sm font-medium ${
                    strategy.bidThresholdPercent < 0
                      ? "text-emerald-400"
                      : strategy.bidThresholdPercent > 0
                        ? "text-amber-400"
                        : "text-[#a1a1aa]"
                  }`}
                >
                  {thresholdLabel}
                </span>
                <span className="text-xs text-[#3f3f46]">+30%</span>
              </div>

              <input
                type="range"
                min={-30}
                max={30}
                step={1}
                value={strategy.bidThresholdPercent}
                onChange={(e) =>
                  setStrategy((s) => ({
                    ...s,
                    bidThresholdPercent: parseInt(e.target.value),
                  }))
                }
                className="pricing-slider w-full"
              />

              <div className="flex justify-between text-[10px] text-[#3f3f46]">
                <span>Bargains only</span>
                <span>Market price</span>
                <span>Willing to pay more</span>
              </div>
            </div>
          </motion.div>

          {/* Price Source */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            className="surface rounded-lg p-5"
          >
            <h2 className="text-sm font-medium text-[#fafafa] mb-1">
              Price Source
            </h2>
            <p className="text-xs text-[#52525b] mb-4">
              Which market data source to use for average prices
            </p>

            <div className="flex gap-2">
              {(["VCP", "CardLadder"] as PriceSource[]).map((source) => (
                <button
                  key={source}
                  onClick={() => setStrategy((s) => ({ ...s, priceSource: source }))}
                  className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-all duration-150 ${
                    strategy.priceSource === source
                      ? "bg-[#27272a] text-[#fafafa] border border-[#3f3f46]"
                      : "bg-[#141416] text-[#52525b] border border-[#1e1e21] hover:text-[#a1a1aa] hover:border-[#27272a]"
                  }`}
                >
                  <span className="block font-medium">{source}</span>
                  <span className="block text-[10px] mt-0.5 opacity-60">
                    {source === "VCP"
                      ? "Best for pre-1980 graded"
                      : "All eras, graded & raw"}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Buyer's Premiums (read-only) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.2 }}
            className="surface rounded-lg p-5"
          >
            <h2 className="text-sm font-medium text-[#fafafa] mb-1">
              Buyer&apos;s Premiums
            </h2>
            <p className="text-xs text-[#52525b] mb-4">
              Platform fees automatically factored into true cost calculations
            </p>

            <div className="space-y-1.5">
              {PLATFORM_LIST.map(({ name, rate, displayRate }) => (
                <div
                  key={name}
                  className="flex items-center justify-between py-2 px-3 rounded-md bg-[#0f0f11] border border-[#1e1e21]"
                >
                  <span className="text-xs text-[#a1a1aa]">{name}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-1 rounded-full bg-[#8b5cf6]/30"
                      style={{ width: `${rate * 250}px` }}
                    />
                    <span className="text-xs font-medium text-[#a1a1aa] w-8 text-right">
                      {displayRate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.25 }}
          >
            <button
              onClick={handleSave}
              className={`w-full py-3 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                saved
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "btn-cta"
              }`}
            >
              {saved ? "Saved!" : "Save Strategy"}
            </button>
          </motion.div>
        </div>
      </main>

      <footer className="px-4 pb-6 pt-2 border-t border-[#1e1e21]">
        <p className="text-center text-[#3f3f46] text-xs">
          CollectHub &middot; Pricing Strategy Settings
        </p>
      </footer>
    </div>
  );
}
