"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import UploadArea from "@/components/UploadArea";
import ProcessingStatus, {
  type ProcessingState,
} from "@/components/ProcessingStatus";
import ImagePreview from "@/components/ImagePreview";
import ActionBar from "@/components/ActionBar";
import { cropImage, type CropImageResponse } from "@/lib/api";

export default function CropPage() {
  const [state, setState] = useState<ProcessingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [result, setResult] = useState<CropImageResponse | null>(null);

  const handleFileSelected = useCallback(async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setOriginalUrl(objectUrl);
    setResult(null);
    setError(null);
    setState("uploading");

    try {
      setState("processing");
      const response = await cropImage(file);
      setResult(response);
      setState("complete");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setState("error");
    }
  }, []);

  const handleReset = useCallback(() => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl(null);
    setResult(null);
    setError(null);
    setState("idle");
  }, [originalUrl]);

  const isProcessing = state === "uploading" || state === "processing";
  const showUpload = state === "idle";

  return (
    <div className="bg-landing min-h-dvh flex flex-col noise-overlay vignette relative overflow-hidden">
      {/* Animated glow blobs */}
      <div className="glow-blob glow-blob-blue" />
      <div className="glow-blob glow-blob-red" />
      <div className="glow-blob glow-blob-blue-bottom" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 px-4 pt-6 pb-2"
      >
        <div className="max-w-lg mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm mb-3 group"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:-translate-x-0.5 transition-transform duration-200"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            <span className="text-white">Crop</span>{" "}
            <span className="bg-gradient-to-r from-[#C8102E] to-[#e8354a] bg-clip-text text-transparent">
              Tool
            </span>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Auto-crop &amp; orient your baseball cards
          </p>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-4 py-4 flex flex-col">
        <div className="max-w-lg mx-auto w-full flex flex-col gap-4 flex-1">
          {/* Upload area - shown when idle */}
          <AnimatePresence mode="wait">
            {showUpload && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="glass-hero rounded-2xl p-5">
                  <UploadArea
                    onFileSelected={handleFileSelected}
                    disabled={isProcessing}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Processing status */}
          <AnimatePresence>
            {state !== "idle" && (
              <motion.div
                key="status"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <ProcessingStatus state={state} error={error} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image preview */}
          <AnimatePresence>
            {originalUrl && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <ImagePreview
                  originalUrl={originalUrl}
                  processedUrl={result?.cropped_image ?? null}
                  isProcessing={isProcessing}
                  confidence={result?.confidence}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action bar - shown after upload initiated */}
          <AnimatePresence>
            {state !== "idle" && (
              <motion.div
                key="actions"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              >
                <ActionBar
                  processedUrl={result?.cropped_image ?? null}
                  onReset={handleReset}
                  isProcessing={isProcessing}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spacer to push content up on mobile */}
          <div className="flex-1" />
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative z-10 px-4 pb-6 pt-2"
      >
        <p className="text-center text-white/20 text-xs">
          CollectHub &middot; Baseball Card Tools
        </p>
      </motion.footer>
    </div>
  );
}
