"use client";

import { useState } from "react";

interface ImagePreviewProps {
  originalUrl: string | null;
  processedUrl: string | null;
  isProcessing: boolean;
  confidence?: number;
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
      {/* Tab switcher */}
      {showProcessed && (
        <div className="flex gap-1 p-1 glass-hero rounded-xl mb-4 w-fit mx-auto">
          <button
            onClick={() => setActiveTab("original")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "original"
                ? "bg-white/12 text-white shadow-sm shadow-white/5"
                : "text-white/40 hover:text-white/60 hover:bg-white/5"
            }`}
          >
            Original
          </button>
          <button
            onClick={() => setActiveTab("processed")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "processed"
                ? "bg-white/12 text-white shadow-sm shadow-white/5"
                : "text-white/40 hover:text-white/60 hover:bg-white/5"
            }`}
          >
            Processed
          </button>
        </div>
      )}

      {/* Image display */}
      <div className="glass-hero rounded-2xl p-3 relative overflow-hidden">
        {/* Original image */}
        {(activeTab === "original" || !showProcessed) && (
          <div className="relative">
            <img
              src={originalUrl}
              alt="Original card"
              className="w-full h-auto rounded-xl max-h-[60vh] object-contain mx-auto block"
            />
            <span className="absolute top-3 left-3 glass-strong text-xs font-medium px-2.5 py-1 rounded-lg text-white/70">
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
            <span className="absolute top-3 left-3 glass-strong text-xs font-medium px-2.5 py-1 rounded-lg text-emerald-400">
              Processed
            </span>
            {confidence !== undefined && (
              <span className="absolute top-3 right-3 glass-strong text-xs font-medium px-2.5 py-1 rounded-lg text-amber-400">
                {Math.round(confidence * 100)}% confidence
              </span>
            )}
          </div>
        )}

        {/* Processing skeleton */}
        {isProcessing && activeTab === "processed" && (
          <div className="relative">
            <div className="skeleton rounded-xl w-full aspect-[2.5/3.5] max-h-[60vh]" />
            <span className="absolute top-3 left-3 glass-strong text-xs font-medium px-2.5 py-1 rounded-lg text-amber-400">
              Processing...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
