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

const steps = ["Upload", "Process", "Download"];

function getStepIndex(state: ProcessingState): number {
  switch (state) {
    case "idle":
      return 0;
    case "uploading":
    case "processing":
      return 1;
    case "complete":
      return 2;
    case "error":
      return 1;
    default:
      return 0;
  }
}

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
  const currentStep = getStepIndex(state);

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
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm group"
          >
            <svg
              width="16"
              height="16"
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
          <span className="text-white/20 text-xs font-medium tracking-widest uppercase">
            CollectHub
          </span>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-4 py-4 flex flex-col">
        <div className="max-w-xl mx-auto w-full flex flex-col gap-5 flex-1">
          {/* Hero title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              <span className="text-white">Card </span>
              <span className="bg-gradient-to-r from-[#C8102E] to-[#e8354a] bg-clip-text text-transparent">
                Cropper
              </span>
            </h1>
            <p className="text-white/40 text-sm mt-1.5">
              Auto-crop, orient &amp; export — PSA &amp; Vault ready
            </p>
          </motion.div>

          {/* Step indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-2 max-w-xs mx-auto w-full px-2"
          >
            {steps.map((label, i) => (
              <div key={label} className="contents">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`step-dot ${
                      i < currentStep
                        ? "completed"
                        : i === currentStep
                          ? "active"
                          : ""
                    }`}
                  />
                  <span
                    className={`text-[10px] font-medium tracking-wide transition-colors duration-300 ${
                      i <= currentStep ? "text-white/60" : "text-white/20"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`step-line mb-4 ${i < currentStep ? "filled" : ""}`}
                  />
                )}
              </div>
            ))}
          </motion.div>

          {/* Upload area */}
          <AnimatePresence mode="wait">
            {showUpload && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 25, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.96 }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="gradient-border-wrap">
                  <div className="glass-hero p-6 sm:p-8">
                    <UploadArea
                      onFileSelected={handleFileSelected}
                      disabled={isProcessing}
                    />
                  </div>
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
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
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
                initial={{ opacity: 0, y: 25, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
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

          {/* Action bar */}
          <AnimatePresence>
            {state !== "idle" && (
              <motion.div
                key="actions"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
              >
                <ActionBar
                  processedUrl={result?.cropped_image ?? null}
                  onReset={handleReset}
                  isProcessing={isProcessing}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1" />
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="relative z-10 px-4 pb-6 pt-2"
      >
        <div className="flex items-center justify-center gap-3 text-white/15 text-xs">
          <span className="w-6 h-px bg-white/10" />
          <span>CollectHub &middot; Baseball Card Tools</span>
          <span className="w-6 h-px bg-white/10" />
        </div>
      </motion.footer>
    </div>
  );
}
