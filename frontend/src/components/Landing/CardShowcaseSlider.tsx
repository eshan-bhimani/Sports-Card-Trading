"use client";

import { useRef, useState, useEffect, useCallback } from "react";
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
  {
    name: "Shohei Ohtani",
    team: "LAD",
    year: "2018",
    set: "Topps Chrome",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#005A9C",
  },
  {
    name: "Mike Trout",
    team: "LAA",
    year: "2011",
    set: "Topps Update",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#BA0021",
  },
  {
    name: "Ronald Acuña Jr.",
    team: "ATL",
    year: "2018",
    set: "Topps Chrome",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#CE1141",
  },
  {
    name: "Mookie Betts",
    team: "LAD",
    year: "2014",
    set: "Bowman Chrome",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#005A9C",
  },
  {
    name: "Aaron Judge",
    team: "NYY",
    year: "2017",
    set: "Topps Chrome",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#003087",
  },
  {
    name: "Juan Soto",
    team: "NYM",
    year: "2018",
    set: "Topps Update",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#002D72",
  },
  {
    name: "Bryce Harper",
    team: "PHI",
    year: "2012",
    set: "Topps Chrome",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#E81828",
  },
  {
    name: "Fernando Tatis Jr.",
    team: "SD",
    year: "2019",
    set: "Topps Chrome",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#2F241D",
  },
  {
    name: "Julio Rodríguez",
    team: "SEA",
    year: "2022",
    set: "Topps Series 1",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#005C5C",
  },
  {
    name: "Freddie Freeman",
    team: "LAD",
    year: "2011",
    set: "Topps Update",
    grade: 9,
    gradeLabel: "Mint",
    color: "#005A9C",
  },
  {
    name: "Corbin Carroll",
    team: "ARI",
    year: "2023",
    set: "Topps Chrome",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#A71930",
  },
  {
    name: "Bobby Witt Jr.",
    team: "KC",
    year: "2022",
    set: "Topps Series 1",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#004687",
  },
];

function CardPlaceholder({ card, index }: { card: CardEntry; index: number }) {
  const initials = card.name
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <div className="relative w-[200px] h-[280px] sm:w-[220px] sm:h-[308px] rounded-xl overflow-hidden flex-shrink-0">
      {/* Card background — simulated card design */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(160deg, ${card.color} 0%, ${card.color}dd 40%, #0a1628 100%)`,
        }}
      />

      {/* Card inner border effect */}
      <div className="absolute inset-[3px] rounded-lg border border-white/10" />

      {/* Holographic shimmer overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
          animation: `shimmerCard${index} 3s ease-in-out infinite`,
        }}
      />

      {/* Top section — team + year */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <span className="text-[10px] font-bold text-white/70 tracking-wider uppercase">
          {card.set}
        </span>
        <span className="text-[10px] font-bold text-white/50">{card.year}</span>
      </div>

      {/* Center — Player initials avatar */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
          <span className="text-2xl sm:text-3xl font-black text-white/60">
            {initials}
          </span>
        </div>
      </div>

      {/* Bottom info area */}
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6 bg-gradient-to-t from-black/60 to-transparent">
        <p className="text-white font-bold text-sm sm:text-base leading-tight truncate">
          {card.name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-white/50 text-[11px] font-medium">
            {card.team}
          </span>
          <span className="grade-badge">
            {card.grade} {card.gradeLabel}
          </span>
        </div>
        <span className="mt-1 inline-block text-[9px] text-white/30 tracking-wide uppercase">
          Cropped + Oriented
        </span>
      </div>
    </div>
  );
}

export default function CardShowcaseSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cardWidth = 236; // card width + gap
  const totalCards = STAR_CARDS.length;

  const scrollTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clampedIndex = Math.max(0, Math.min(index, totalCards - 1));
      setActiveIndex(clampedIndex);
      const scrollLeft =
        clampedIndex * cardWidth -
        (track.clientWidth / 2 - cardWidth / 2);
      track.scrollTo({ left: scrollLeft, behavior: "smooth" });
    },
    [totalCards]
  );

  const next = useCallback(() => {
    scrollTo((activeIndex + 1) % totalCards);
  }, [activeIndex, scrollTo, totalCards]);

  const prev = useCallback(() => {
    scrollTo((activeIndex - 1 + totalCards) % totalCards);
  }, [activeIndex, scrollTo, totalCards]);

  // Auto-advance
  useEffect(() => {
    if (isPaused) return;
    autoplayRef.current = setInterval(() => {
      next();
    }, 3500);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [isPaused, next]);

  // Track scroll position to update dots
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const center = track.scrollLeft + track.clientWidth / 2;
      const idx = Math.round(center / cardWidth);
      setActiveIndex(Math.max(0, Math.min(idx, totalCards - 1)));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [totalCards]);

  return (
    <section className="relative z-10 px-4 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Section header */}
        <div className="text-center mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white/90">
            Premium Card Showcase
          </h2>
          <p className="text-xs sm:text-sm text-white/40 mt-1">
            Star player cards, auto-cropped and graded
          </p>
        </div>

        {/* Dashboard frame */}
        <div
          className="glass-card rounded-2xl p-4 sm:p-6"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Carousel */}
          <div className="relative">
            {/* Left arrow */}
            <button
              onClick={prev}
              aria-label="Previous card"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full glass-strong flex items-center justify-center text-white/60 hover:text-white transition-colors -ml-2 sm:-ml-4"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Right arrow */}
            <button
              onClick={next}
              aria-label="Next card"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full glass-strong flex items-center justify-center text-white/60 hover:text-white transition-colors -mr-2 sm:-mr-4"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            {/* Track */}
            <div
              ref={trackRef}
              className="carousel-track px-6 sm:px-8"
            >
              {STAR_CARDS.map((card, i) => (
                <div key={card.name} className="carousel-slide">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <CardPlaceholder card={card} index={i} />
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination dots */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {STAR_CARDS.map((card, i) => (
              <button
                key={card.name}
                onClick={() => scrollTo(i)}
                aria-label={`Go to card ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "w-6 h-2 bg-[#C8102E]"
                    : "w-2 h-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
