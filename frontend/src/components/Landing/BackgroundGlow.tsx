"use client";

export default function BackgroundGlow() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Primary blue blob — top center */}
      <div className="glow-blob glow-blob-blue" />

      {/* Red accent blob — top right */}
      <div className="glow-blob glow-blob-red" />

      {/* Secondary blue blob — bottom left */}
      <div className="glow-blob glow-blob-blue-bottom" />

      {/* Deep blue accent — bottom right */}
      <div className="glow-blob glow-blob-accent" />
    </div>
  );
}
