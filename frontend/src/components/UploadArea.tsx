"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";

interface UploadAreaProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_SIZE_MB = 10;

export default function UploadArea({ onFileSelected, disabled }: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith(".heic")) {
      return "Please upload a JPEG, PNG, WebP, or HEIC image.";
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File is too large. Maximum size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      onFileSelected(file);
    },
    [onFileSelected, validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      if (inputRef.current) inputRef.current.value = "";
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`
          upload-zone rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-300 min-h-[220px]
          flex flex-col items-center justify-center gap-5
          ${isDragOver ? "drag-over" : ""}
          ${disabled ? "opacity-50 cursor-not-allowed" : "active:scale-[0.98]"}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Animated upload icon */}
        <motion.div
          animate={isDragOver ? { scale: 1.15, y: -5 } : { scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`
            w-20 h-20 rounded-2xl flex items-center justify-center
            transition-all duration-300 upload-icon-container
            ${isDragOver ? "upload-icon-active" : ""}
          `}
        >
          <svg
            className={`w-9 h-9 transition-colors duration-300 ${isDragOver ? "text-blue-300" : "text-blue-400"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </motion.div>

        <div>
          <p className="text-white/90 font-semibold text-lg">
            {isDragOver ? "Drop your card image" : "Upload a card image"}
          </p>
          <p className="text-white/40 text-sm mt-1.5">
            Tap to select or drag &amp; drop
          </p>
        </div>

        {/* File type badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {["JPEG", "PNG", "WebP", "HEIC"].map((format) => (
            <span
              key={format}
              className="text-[10px] font-medium text-white/30 px-2 py-0.5 rounded-md bg-white/5 border border-white/5"
            >
              {format}
            </span>
          ))}
          <span className="text-[10px] text-white/20">Max {MAX_SIZE_MB}MB</span>
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm mt-3 text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
