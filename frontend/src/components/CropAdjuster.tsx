"use client";

import { useCallback, useRef, useState } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { motion } from "framer-motion";

interface CropAdjusterProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onSkip: () => void;
}

export default function CropAdjuster({
  imageUrl,
  onCropComplete,
  onSkip,
}: CropAdjusterProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 5,
    y: 5,
    width: 90,
    height: 90,
  });
  const [isApplying, setIsApplying] = useState(false);

  const getCroppedImage = useCallback(
    (pixelCrop: PixelCrop): string | null => {
      const image = imgRef.current;
      if (!image) return null;

      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = pixelCrop.width * scaleX;
      canvas.height = pixelCrop.height * scaleY;

      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        image,
        pixelCrop.x * scaleX,
        pixelCrop.y * scaleY,
        pixelCrop.width * scaleX,
        pixelCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      return canvas.toDataURL("image/png");
    },
    []
  );

  const handleApplyCrop = useCallback(() => {
    if (!imgRef.current) return;
    setIsApplying(true);

    // Convert percentage crop to pixel crop
    const image = imgRef.current;
    const pixelCrop: PixelCrop = {
      unit: "px",
      x: (crop.x / 100) * image.width,
      y: (crop.y / 100) * image.height,
      width: (crop.width / 100) * image.width,
      height: (crop.height / 100) * image.height,
    };

    const croppedUrl = getCroppedImage(pixelCrop);
    if (croppedUrl) {
      onCropComplete(croppedUrl);
    }
    setIsApplying(false);
  }, [crop, getCroppedImage, onCropComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-white/90 font-semibold text-sm">
            Fine-tune your crop
          </h3>
          <p className="text-white/40 text-xs mt-0.5">
            Drag the corners to adjust the crop region
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSkip}
            className="text-xs text-white/40 hover:text-white/60 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Crop area */}
      <div className="glass-hero rounded-2xl p-3 overflow-hidden">
        <div className="rounded-xl overflow-hidden crop-adjuster-container">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            className="max-h-[55vh] mx-auto block"
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Adjust crop"
              className="max-h-[55vh] w-auto mx-auto block"
              crossOrigin="anonymous"
            />
          </ReactCrop>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleApplyCrop}
          disabled={isApplying}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm btn-cta active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
          {isApplying ? "Applying..." : "Apply Crop"}
        </button>
        <button
          onClick={onSkip}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm glass-hero hover:bg-white/10 active:scale-[0.97] transition-all duration-300 text-white/80 flex items-center justify-center gap-2"
        >
          Use Auto-Crop
        </button>
      </div>
    </motion.div>
  );
}
