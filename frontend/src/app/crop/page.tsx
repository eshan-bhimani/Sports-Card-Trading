"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import UploadArea from "@/components/UploadArea";
import ProcessingStatus, {
  type ProcessingState,
} from "@/components/ProcessingStatus";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import CropAdjuster from "@/components/CropAdjuster";
import ActionBar from "@/components/ActionBar";
import StepIndicator, { type CropStep } from "@/components/StepIndicator";
import { cropImage, type CropImageResponse } from "@/lib/api";

type ViewMode = "upload" | "processing" | "result" | "adjust";

export default function CropPage() {
  const [state, setState] = useState<ProcessingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [result, setResult] = useState<CropImageResponse | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("upload");
  const [adjustedUrl, setAdjustedUrl] = useState<string | null>(null);

  const currentStep: CropStep =
    viewMode === "upload"
      ? "upload"
      : viewMode === "processing"
      ? "processing"
      : viewMode === "adjust"
      ? "adjust"
      : "export";

  const handleFileSelected = useCallback(async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setOriginalUrl(objectUrl);
    setResult(null);
    setAdjustedUrl(null);
    setError(null);
    setState("uploading");
    setViewMode("processing");

    try {
      setState("processing");
      const response = await cropImage(file);
      setResult(response);
      setState("complete");
      setViewMode("result");
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
    setAdjustedUrl(null);
    setError(null);
    setState("idle");
    setViewMode("upload");
  }, [originalUrl]);

  const handleAdjustCrop = useCallback(() => {
    setViewMode("adjust");
  }, []);

  const handleCropComplete = useCallback((croppedUrl: string) => {
    setAdjustedUrl(croppedUrl);
    setViewMode("result");
  }, []);

  const handleSkipAdjust = useCallback(() => {
    setViewMode("result");
  }, []);

  const isProcessing = state === "uploading" || state === "processing";
  const displayUrl = adjustedUrl ?? result?.cropped_image ?? null;

  return (
    <div className="min-h-dvh flex flex-col bg-[#09090b]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="px-4 pt-6 pb-4 border-b border-[#1e1e21]"
      >
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[#52525b] hover:text-[#a1a1aa] transition-colors text-sm mb-3 group"
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
              className="group-hover:-translate-x-0.5 transition-transform duration-150"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#fafafa]">
                Crop Tool
              </h1>
              <p className="text-[#52525b] text-sm mt-1">
                Auto-crop &amp; orient your baseball cards
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Step indicator */}
      <div className="px-4 py-3 border-b border-[#1e1e21]">
        <div className="max-w-2xl mx-auto">
          <StepIndicator currentStep={currentStep} />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 px-4 py-6 flex flex-col">
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-4 flex-1">
          <AnimatePresence mode="wait">
            {/* Upload area */}
            {viewMode === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
              >
                <div className="surface rounded-lg p-5">
                  <UploadArea
                    onFileSelected={handleFileSelected}
                    disabled={isProcessing}
                  />
                </div>
              </motion.div>
            )}

            {/* Processing state */}
            {viewMode === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <ProcessingStatus state={state} error={error} />
                {originalUrl && (
                  <div className="surface rounded-lg p-3">
                    <div className="relative">
                      <img
                        src={originalUrl}
                        alt="Original card"
                        className={`w-full h-auto rounded-md max-h-[50vh] object-contain mx-auto block ${
                          isProcessing ? "processing-image" : ""
                        }`}
                      />
                      <span className="absolute top-3 left-3 bg-[#1c1c1f] border border-[#27272a] text-xs font-medium px-2.5 py-1 rounded-md text-[#71717a]">
                        Original
                      </span>
                    </div>
                  </div>
                )}
                {state === "error" && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-3 rounded-lg font-medium text-sm btn-secondary active:scale-[0.98] transition-all duration-150"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Result view with before/after slider */}
            {viewMode === "result" && originalUrl && displayUrl && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <ProcessingStatus state={state} error={error} />
                <BeforeAfterSlider
                  beforeUrl={originalUrl}
                  afterUrl={displayUrl}
                  confidence={result?.confidence}
                />
                <ActionBar
                  processedUrl={displayUrl}
                  onReset={handleReset}
                  isProcessing={isProcessing}
                  onAdjustCrop={handleAdjustCrop}
                  showAdjust={!adjustedUrl}
                />
              </motion.div>
            )}

            {/* Crop adjuster view */}
            {viewMode === "adjust" && displayUrl && (
              <motion.div
                key="adjust"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CropAdjuster
                  imageUrl={displayUrl}
                  onCropComplete={handleCropComplete}
                  onSkip={handleSkipAdjust}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1" />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 pb-6 pt-2 border-t border-[#1e1e21]">
        <p className="text-center text-[#3f3f46] text-xs">
          CollectHub &middot; Baseball Card Tools
        </p>
      </footer>
    </div>
  );
}
