"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import GlassContainer from "@/components/GlassContainer";
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
    <div className="bg-gradient-animated min-h-dvh flex flex-col">
      {/* Header */}
      <header className="px-4 pt-6 pb-2">
        <div className="max-w-lg mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm mb-3"
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
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Crop Tool
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Auto-crop &amp; orient your baseball cards
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-4 flex flex-col">
        <div className="max-w-lg mx-auto w-full flex flex-col gap-4 flex-1">
          {/* Upload area - shown when idle */}
          {showUpload && (
            <GlassContainer className="p-4" strong>
              <UploadArea
                onFileSelected={handleFileSelected}
                disabled={isProcessing}
              />
            </GlassContainer>
          )}

          {/* Processing status */}
          {state !== "idle" && (
            <ProcessingStatus state={state} error={error} />
          )}

          {/* Image preview */}
          {originalUrl && (
            <ImagePreview
              originalUrl={originalUrl}
              processedUrl={result?.cropped_image ?? null}
              isProcessing={isProcessing}
              confidence={result?.confidence}
            />
          )}

          {/* Action bar - shown after upload initiated */}
          {state !== "idle" && (
            <ActionBar
              processedUrl={result?.cropped_image ?? null}
              onReset={handleReset}
              isProcessing={isProcessing}
            />
          )}

          {/* Spacer to push content up on mobile */}
          <div className="flex-1" />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 pb-6 pt-2">
        <p className="text-center text-white/20 text-xs">
          ConventionConnection &middot; Baseball Card Tools
        </p>
      </footer>
    </div>
  );
}
