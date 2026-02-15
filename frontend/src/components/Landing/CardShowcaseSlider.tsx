"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useAnimationControls } from "framer-motion";

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

// Duplicate the cards so the marquee can loop seamlessly
const MARQUEE_CARDS = [...STAR_CARDS, ...STAR_CARDS];

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

// Width of one card + gap (200px card + 16px gap on mobile, 220px + 16px on sm+)
const CARD_SLOT_WIDTH = 216; // mobile default
const CARD_SLOT_WIDTH_SM = 236;
const TOTAL_SET_WIDTH = STAR_CARDS.length * CARD_SLOT_WIDTH;
const TOTAL_SET_WIDTH_SM = STAR_CARDS.length * CARD_SLOT_WIDTH_SM;
const SLIDE_DURATION = 40; // seconds for full set to scroll past

export default function CardShowcaseSlider() {
  const controls = useAnimationControls();
  const [isPaused, setIsPaused] = useState(false);
  const [isSm, setIsSm] = useState(false);
  const xRef = useRef(0);

  // Detect sm breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    setIsSm(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsSm(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const totalWidth = isSm ? TOTAL_SET_WIDTH_SM : TOTAL_SET_WIDTH;

  // Start or resume the infinite scroll animation
  const startScroll = useCallback(() => {
    // Calculate remaining fraction to maintain consistent speed
    const remaining = totalWidth - Math.abs(xRef.current % totalWidth);
    const remainingFraction = remaining / totalWidth;

    controls.start({
      x: [xRef.current, xRef.current - remaining, -totalWidth],
      transition: {
        x: {
          duration: SLIDE_DURATION * remainingFraction,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop" as const,
          repeatDelay: 0,
        },
      },
    });
  }, [controls, totalWidth]);

  // Pause / resume
  useEffect(() => {
    if (isPaused) {
      controls.stop();
    } else {
      startScroll();
    }
  }, [isPaused, startScroll, controls]);

  // Track current x so we can resume from the right place
  const handleUpdate = useCallback((latest: Record<string, number>) => {
    if (typeof latest.x === "number") {
      xRef.current = latest.x;
    }
  }, []);

  return (
    <section className="relative z-10 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        {/* Section header */}
        <div className="text-center mb-6 px-4">
          <h2 className="text-lg sm:text-xl font-bold text-white/90">
            Premium Card Showcase
          </h2>
          <p className="text-xs sm:text-sm text-white/40 mt-1">
            Star player cards, auto-cropped and graded
          </p>
        </div>

        {/* Dashboard frame */}
        <div
          className="glass-card rounded-2xl py-6 sm:py-8 mx-4 overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 z-10 bg-gradient-to-r from-black/40 to-transparent rounded-l-2xl" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 z-10 bg-gradient-to-l from-black/40 to-transparent rounded-r-2xl" />

          {/* Marquee track */}
          <motion.div
            className="flex gap-4 w-max"
            animate={controls}
            onUpdate={handleUpdate}
          >
            {MARQUEE_CARDS.map((card, i) => (
              <motion.div
                key={`${card.name}-${i}`}
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <CardPlaceholder card={card} index={i % STAR_CARDS.length} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
