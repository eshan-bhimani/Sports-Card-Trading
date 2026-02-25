"use client";

import { useState } from "react";

interface ImagePreviewProps {
  originalUrl: string | null;
  processedUrl: string | null;
  isProcessing: boolean;
  confidence?: number;
}

function ConfidenceRing({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value * circumference);

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 52 52">
          <circle
            className="confidence-ring-track"
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            strokeWidth="3"
          />
          <circle
            className="confidence-ring-fill"
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            strokeWidth="3"
            stroke={pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444"}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/80">
          {pct}
        </span>
      </div>
      <div>
        <p className="text-xs font-semibold text-white/70">Confidence</p>
        <p className={`text-[10px] ${
          pct >= 80 ? "text-emerald-400" : pct >= 60 ? "text-amber-400" : "text-red-400"
        }`}>
          {pct >= 80 ? "High" : pct >= 60 ? "Medium" : "Low"}
        </p>
      </div>
    </div>
  );
}

export default function ImagePreview({
  originalUrl,
  processedUrl,
  isProcessing,
  confidence,
}: ImagePreviewProps) {
  const [activeTab, setActiveTab] = useState<"original" | "processed">("processed");

  if (!originalUrl) return null;

  const showProcessed = processedUrl && !isProcessing;

  return (
    <div className="w-full">
      {/* Tab switcher + confidence */}
      {showProcessed && (
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex gap-1 p-1 glass-hero rounded-xl">
            <button
              onClick={() => setActiveTab("original")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeTab === "original"
                  ? "bg-white/12 text-white shadow-sm shadow-white/5"
                  : "text-white/35 hover:text-white/55 hover:bg-white/5"
              }`}
            >
              Original
            </button>
            <button
              onClick={() => setActiveTab("processed")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeTab === "processed"
                  ? "bg-white/12 text-white shadow-sm shadow-white/5"
                  : "text-white/35 hover:text-white/55 hover:bg-white/5"
              }`}
            >
              Processed
            </button>
          </div>
          {confidence !== undefined && (
            <ConfidenceRing value={confidence} />
          )}
        </div>
      )}

      {/* Image display */}
      <div className="glass-hero rounded-2xl p-3 relative overflow-hidden">
        {/* Original image */}
        {(activeTab === "original" || !showProcessed) && !isProcessing && (
          <div className="relative">
            <img
              src={originalUrl}
              alt="Original card"
              className="w-full h-auto rounded-xl max-h-[60vh] object-contain mx-auto block"
            />
            <span className="absolute top-3 left-3 glass-strong text-[10px] font-semibold px-2.5 py-1 rounded-lg text-white/50 uppercase tracking-wider">
              Original
            </span>
          </div>
        )}

        {/* Processed image */}
        {activeTab === "processed" && showProcessed && (
          <div className="relative">
            <img
              src={processedUrl}
              alt="Processed card"
              className="w-full h-auto rounded-xl max-h-[60vh] object-contain mx-auto block"
            />
            <span className="absolute top-3 left-3 glass-strong text-[10px] font-semibold px-2.5 py-1 rounded-lg text-emerald-400/80 uppercase tracking-wider">
              Cropped
            </span>
          </div>
        )}

        {/* Processing skeleton */}
        {isProcessing && (
          <div className="relative">
            <div className="skeleton rounded-xl w-full aspect-[2.5/3.5] max-h-[60vh]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="glass-strong rounded-xl px-4 py-2.5 flex items-center gap-2.5">
                <svg className="w-4 h-4 spinner text-amber-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path d="M12 2a10 10 0 019.75 7.75" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <span className="text-xs font-medium text-white/60">Processing...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
