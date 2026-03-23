"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface CardEntry {
  name: string;
  team: string;
  year: string;
  set: string;
  grade: number;
  gradeLabel: string;
  color: string;
}

const STAR_CARDS: CardEntry[] = [
  { name: "Shohei Ohtani", team: "LAD", year: "2018", set: "Topps Chrome", grade: 10, gradeLabel: "Gem Mint", color: "#005A9C" },
  { name: "Mike Trout", team: "LAA", year: "2011", set: "Topps Update", grade: 10, gradeLabel: "Gem Mint", color: "#BA0021" },
  { name: "Ronald Acuña Jr.", team: "ATL", year: "2018", set: "Topps Chrome", grade: 10, gradeLabel: "Gem Mint", color: "#CE1141" },
  { name: "Mookie Betts", team: "LAD", year: "2014", set: "Bowman Chrome", grade: 10, gradeLabel: "Gem Mint", color: "#005A9C" },
  { name: "Aaron Judge", team: "NYY", year: "2017", set: "Topps Chrome", grade: 10, gradeLabel: "Gem Mint", color: "#003087" },
  { name: "Juan Soto", team: "NYM", year: "2018", set: "Topps Update", grade: 10, gradeLabel: "Gem Mint", color: "#002D72" },
  { name: "Bryce Harper", team: "PHI", year: "2012", set: "Topps Chrome", grade: 10, gradeLabel: "Gem Mint", color: "#E81828" },
  { name: "Fernando Tatis Jr.", team: "SD", year: "2019", set: "Topps Chrome", grade: 10, gradeLabel: "Gem Mint", color: "#2F241D" },
  { name: "Julio Rodríguez", team: "SEA", year: "2022", set: "Topps Series 1", grade: 10, gradeLabel: "Gem Mint", color: "#005C5C" },
  { name: "Freddie Freeman", team: "LAD", year: "2011", set: "Topps Update", grade: 9, gradeLabel: "Mint", color: "#005A9C" },
  { name: "Corbin Carroll", team: "ARI", year: "2023", set: "Topps Chrome", grade: 10, gradeLabel: "Gem Mint", color: "#A71930" },
  { name: "Bobby Witt Jr.", team: "KC", year: "2022", set: "Topps Series 1", grade: 10, gradeLabel: "Gem Mint", color: "#004687" },
];

function CardPlaceholder({ card }: { card: CardEntry }) {
  const initials = card.name
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <div className="relative w-[180px] h-[252px] sm:w-[200px] sm:h-[280px] rounded-lg overflow-hidden flex-shrink-0 bg-[#141416] border border-[#1e1e21] group">
      {/* Card color strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: card.color }}
      />

      {/* Card header */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between">
        <span className="text-[9px] font-medium text-[#52525b] tracking-wider uppercase">
          {card.set}
        </span>
        <span className="text-[9px] font-medium text-[#3f3f46]">{card.year}</span>
      </div>

      {/* Center initials */}
      <div className="flex-1 flex items-center justify-center py-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1c1c1f] border border-[#27272a] flex items-center justify-center">
          <span className="text-xl sm:text-2xl font-bold text-[#52525b]">
            {initials}
          </span>
        </div>
      </div>

      {/* Card footer */}
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-4 bg-gradient-to-t from-[#141416] via-[#141416] to-transparent">
        <p className="text-[#e4e4e7] font-medium text-sm leading-tight truncate">
          {card.name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[#52525b] text-[11px]">
            {card.team}
          </span>
          <span className="grade-badge text-[9px]">
            {card.grade} {card.gradeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CardShowcaseSlider() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="py-12 sm:py-16 border-t border-[#1e1e21]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto"
      >
        {/* Section header */}
        <div className="mb-6 px-4">
          <h2 className="text-lg font-semibold text-[#fafafa]">
            Premium Card Showcase
          </h2>
          <p className="text-sm text-[#71717a] mt-1">
            Star player cards, auto-cropped and graded
          </p>
        </div>

        {/* Slider container */}
        <div
          className="py-6 mx-4 overflow-hidden relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 z-10 bg-gradient-to-r from-[#09090b] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 z-10 bg-gradient-to-l from-[#09090b] to-transparent" />

          <div
            className="marquee-track"
            style={{
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {STAR_CARDS.map((card) => (
              <div key={`a-${card.name}`} className="flex-shrink-0">
                <CardPlaceholder card={card} />
              </div>
            ))}
            {STAR_CARDS.map((card) => (
              <div key={`b-${card.name}`} className="flex-shrink-0">
                <CardPlaceholder card={card} />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
