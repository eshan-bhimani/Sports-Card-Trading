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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-[#fafafa] font-medium text-sm">
            Fine-tune your crop
          </h3>
          <p className="text-[#52525b] text-xs mt-0.5">
            Drag the corners to adjust the crop region
          </p>
        </div>
        <button
          onClick={onSkip}
          className="text-xs text-[#52525b] hover:text-[#a1a1aa] transition-colors px-3 py-1.5 rounded-md hover:bg-[#141416]"
        >
          Skip
        </button>
      </div>

      {/* Crop area */}
      <div className="surface rounded-lg p-3 overflow-hidden">
        <div className="rounded-md overflow-hidden crop-adjuster-container">
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
      <div className="flex gap-2">
        <button
          onClick={handleApplyCrop}
          disabled={isApplying}
          className="flex-1 py-3 rounded-lg font-medium text-sm btn-cta active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
          {isApplying ? "Applying..." : "Apply Crop"}
        </button>
        <button
          onClick={onSkip}
          className="flex-1 py-3 rounded-lg font-medium text-sm btn-secondary active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
        >
          Use Auto-Crop
        </button>
      </div>
    </motion.div>
  );
}
