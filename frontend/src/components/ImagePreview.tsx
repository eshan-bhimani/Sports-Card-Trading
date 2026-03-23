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
        <div className="flex gap-0.5 p-0.5 bg-[#141416] border border-[#1e1e21] rounded-lg mb-4 w-fit mx-auto">
          <button
            onClick={() => setActiveTab("original")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
              activeTab === "original"
                ? "bg-[#27272a] text-[#fafafa]"
                : "text-[#52525b] hover:text-[#a1a1aa]"
            }`}
          >
            Original
          </button>
          <button
            onClick={() => setActiveTab("processed")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
              activeTab === "processed"
                ? "bg-[#27272a] text-[#fafafa]"
                : "text-[#52525b] hover:text-[#a1a1aa]"
            }`}
          >
            Processed
          </button>
        </div>
      )}

      {/* Image display */}
      <div className="surface rounded-lg p-3 relative overflow-hidden">
        {/* Original image */}
        {(activeTab === "original" || !showProcessed) && (
          <div className="relative">
            <img
              src={originalUrl}
              alt="Original card"
              className="w-full h-auto rounded-md max-h-[60vh] object-contain mx-auto block"
            />
            <span className="absolute top-3 left-3 bg-[#1c1c1f] border border-[#27272a] text-xs font-medium px-2.5 py-1 rounded-md text-[#71717a]">
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
              className="w-full h-auto rounded-md max-h-[60vh] object-contain mx-auto block"
            />
            <span className="absolute top-3 left-3 bg-[#1c1c1f] border border-[#27272a] text-xs font-medium px-2.5 py-1 rounded-md text-emerald-400">
              Processed
            </span>
            {confidence !== undefined && (
              <span className="absolute top-3 right-3 bg-[#1c1c1f] border border-[#27272a] text-xs font-medium px-2.5 py-1 rounded-md text-amber-400">
                {Math.round(confidence * 100)}% confidence
              </span>
            )}
          </div>
        )}

        {/* Processing skeleton */}
        {isProcessing && activeTab === "processed" && (
          <div className="relative">
            <div className="skeleton rounded-md w-full aspect-[2.5/3.5] max-h-[60vh]" />
            <span className="absolute top-3 left-3 bg-[#1c1c1f] border border-[#27272a] text-xs font-medium px-2.5 py-1 rounded-md text-amber-400">
              Processing...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
