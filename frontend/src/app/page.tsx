"use client";

import HeroGlass from "@/components/Landing/HeroGlass";
import CardShowcaseSlider from "@/components/Landing/CardShowcaseSlider";
import FeatureTiles from "@/components/Landing/FeatureTiles";
import CTASection from "@/components/Landing/CTASection";

export default function Home() {
  return (
    <div className="bg-landing min-h-dvh noise-overlay vignette">
      {/* Animated glow blobs */}
      <div className="glow-blob glow-blob-blue" />
      <div className="glow-blob glow-blob-red" />
      <div className="glow-blob glow-blob-blue-bottom" />

      {/* Hero */}
      <HeroGlass />

      {/* Card showcase slider */}
      <CardShowcaseSlider />

      {/* Feature tiles */}
      <FeatureTiles />

      {/* Final CTA */}
      <CTASection />

      {/* Footer */}
      <footer className="relative z-10 px-4 pb-8 pt-4">
        <p className="text-center text-white/20 text-xs">
          CollectHub &middot; Baseball Card Tools
        </p>
      </footer>
    </div>
  );
}
