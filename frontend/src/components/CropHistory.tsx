"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  loadHistory,
  clearHistory,
  formatRelativeTime,
  type CropHistoryItem,
} from "@/lib/cropHistoryStore";

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color =
    pct >= 80
      ? "text-emerald-400 bg-emerald-400/10"
      : pct >= 50
      ? "text-amber-400 bg-amber-400/10"
      : "text-red-400 bg-red-400/10";
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {pct}%
    </span>
  );
}

export default function CropHistory() {
  const [history, setHistory] = useState<CropHistoryItem[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  function handleClear() {
    clearHistory();
    setHistory([]);
  }

  if (history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass-hero rounded-2xl p-8 flex flex-col items-center gap-3 text-center"
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white/20"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <p className="text-white/40 text-sm">No crops yet.</p>
        <p className="text-white/25 text-xs">
          Your last 20 cropped cards will appear here.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-3"
    >
      <div className="flex items-center justify-between px-0.5">
        <p className="text-white/40 text-xs">
          {history.length} of 20 stored
        </p>
        <button
          onClick={handleClear}
          className="text-xs text-white/30 hover:text-red-400 transition-colors"
        >
          Clear all
        </button>
      </div>

      <AnimatePresence initial={false}>
        {history.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
            className="glass-hero rounded-2xl p-4 flex gap-4 items-center"
          >
            {/* Thumbnails */}
            <div className="flex items-center gap-2 shrink-0">
              <img
                src={item.originalThumbnail}
                alt="Original"
                className="w-16 h-20 object-cover rounded-lg border border-white/10"
              />
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white/30 shrink-0"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <img
                src={item.croppedThumbnail}
                alt="Cropped"
                className="w-16 h-20 object-cover rounded-lg border border-white/10"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              <p className="text-white/80 text-sm font-medium truncate">
                {item.playerName || "Unknown card"}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-white/30 text-xs">Confidence</span>
                <ConfidenceBadge confidence={item.confidence} />
              </div>
              <p className="text-white/25 text-xs">
                {formatRelativeTime(item.timestamp)}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
