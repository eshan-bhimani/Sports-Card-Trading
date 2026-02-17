"use client";

import BackgroundGlow from "@/components/Landing/BackgroundGlow";
import HeroProductPanel from "@/components/Landing/HeroProductPanel";
import MicroStoryTiles from "@/components/Landing/MicroStoryTiles";
import ShowcaseDashboard from "@/components/Landing/ShowcaseDashboard";
import FinalCTA from "@/components/Landing/FinalCTA";

export default function Home() {
  return (
    <div className="bg-landing min-h-dvh noise-overlay vignette relative">
      {/* Layered glow blobs — background depth */}
      <BackgroundGlow />

      {/* Hero product panel — midground */}
      <HeroProductPanel />

      {/* 3-step micro-story */}
      <MicroStoryTiles />

      {/* Premium card showcase — foreground */}
      <ShowcaseDashboard />

      {/* Final CTA strip */}
      <FinalCTA />

      {/* Footer */}
      <footer className="relative z-10 px-4 pb-6">
        <p className="text-center text-white/15 text-[11px] tracking-wide">
          ConventionConnection &middot; Baseball Card Tools
        </p>
      </footer>
    </div>
  );
}
