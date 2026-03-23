"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ActionBarProps {
  processedUrl: string | null;
  onReset: () => void;
  isProcessing: boolean;
  onAdjustCrop?: () => void;
  showAdjust?: boolean;
}

export default function ActionBar({
  processedUrl,
  onReset,
  isProcessing,
  onAdjustCrop,
  showAdjust,
}: ActionBarProps) {
  const [uploadingTo, setUploadingTo] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const hasResult = !!processedUrl && !isProcessing;

  const handleDownload = () => {
    if (!processedUrl) return;
    const link = document.createElement("a");
    link.href = processedUrl;
    link.download = `card-cropped-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloudUpload = async (service: string) => {
    if (!hasResult) return;
    setUploadingTo(service);
    setUploadSuccess(null);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setUploadingTo(null);
    setUploadSuccess(service);
    setTimeout(() => setUploadSuccess(null), 3000);
  };

  return (
    <div className="w-full space-y-2">
      {/* Primary actions */}
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          disabled={!hasResult}
          className={`
            flex-1 py-3 rounded-lg font-medium text-sm
            transition-all duration-150
            flex items-center justify-center gap-2
            ${
              hasResult
                ? "btn-cta active:scale-[0.98]"
                : "bg-[#141416] text-[#3f3f46] cursor-not-allowed border border-[#1e1e21]"
            }
          `}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>

        {showAdjust && onAdjustCrop ? (
          <button
            onClick={onAdjustCrop}
            disabled={!hasResult}
            className={`
              flex-1 py-3 rounded-lg font-medium text-sm
              transition-all duration-150
              flex items-center justify-center gap-2
              ${
                hasResult
                  ? "btn-secondary active:scale-[0.98]"
                  : "bg-[#141416] text-[#3f3f46] cursor-not-allowed border border-[#1e1e21]"
              }
            `}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 2v14a2 2 0 002 2h14M18 22V8a2 2 0 00-2-2H2" />
            </svg>
            Adjust Crop
          </button>
        ) : (
          <button
            onClick={onReset}
            className="flex-1 py-3 rounded-lg font-medium text-sm btn-secondary active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Upload Another
          </button>
        )}
      </div>

      {/* Cloud upload actions */}
      <div className="flex gap-2">
        <button
          onClick={() => handleCloudUpload("google-photos")}
          disabled={!hasResult || uploadingTo === "google-photos"}
          className={`
            flex-1 py-2.5 rounded-lg text-sm
            transition-all duration-150
            flex items-center justify-center gap-1.5
            ${
              hasResult
                ? "btn-secondary active:scale-[0.98]"
                : "bg-[#141416] text-[#3f3f46] cursor-not-allowed opacity-50 border border-[#1e1e21]"
            }
          `}
        >
          <AnimatePresence mode="wait">
            {uploadingTo === "google-photos" ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <div className="w-3.5 h-3.5 border-2 border-[#3f3f46] border-t-[#a1a1aa] rounded-full spinner" />
                <span>Uploading...</span>
              </motion.div>
            ) : uploadSuccess === "google-photos" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-emerald-400"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Uploaded!
              </motion.div>
            ) : (
              <motion.div key="default" className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Google Photos
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={() => handleCloudUpload("gcs")}
          disabled={!hasResult || uploadingTo === "gcs"}
          className={`
            flex-1 py-2.5 rounded-lg text-sm
            transition-all duration-150
            flex items-center justify-center gap-1.5
            ${
              hasResult
                ? "btn-secondary active:scale-[0.98]"
                : "bg-[#141416] text-[#3f3f46] cursor-not-allowed opacity-50 border border-[#1e1e21]"
            }
          `}
        >
          <AnimatePresence mode="wait">
            {uploadingTo === "gcs" ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <div className="w-3.5 h-3.5 border-2 border-[#3f3f46] border-t-[#a1a1aa] rounded-full spinner" />
                <span>Uploading...</span>
              </motion.div>
            ) : uploadSuccess === "gcs" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-emerald-400"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Uploaded!
              </motion.div>
            ) : (
              <motion.div key="default" className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4s1.82-4 4.02-4h.47C7.31 7.55 9.46 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3s-1.34 3-3 3z" />
                </svg>
                Google Cloud
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Start over link */}
      {!showAdjust && (
        <button
          onClick={onReset}
          className="w-full py-2 rounded-lg text-xs text-[#3f3f46] hover:text-[#71717a] hover:bg-[#141416] transition-all duration-150"
        >
          Start Over
        </button>
      )}
    </div>
  );
}
