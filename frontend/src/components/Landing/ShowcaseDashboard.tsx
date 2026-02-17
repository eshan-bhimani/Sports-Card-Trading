"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  CSSProperties,
} from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Award } from "lucide-react";

interface CardEntry {
  name: string;
  team: string;
  year: string;
  set: string;
  grade: number;
  gradeLabel: string;
  accent: string; // team accent color
  bg: string;    // card gradient top color
}

const CARDS: CardEntry[] = [
  { name: "Shohei Ohtani",       team: "LAD", year: "2018", set: "Topps Chrome",   grade: 10, gradeLabel: "Gem Mint", accent: "#1d6fb5", bg: "#004A99" },
  { name: "Mike Trout",          team: "LAA", year: "2011", set: "Topps Update",   grade: 10, gradeLabel: "Gem Mint", accent: "#C8102E", bg: "#9B0825" },
  { name: "Ronald Acuña Jr.",    team: "ATL", year: "2018", set: "Topps Chrome",   grade: 10, gradeLabel: "Gem Mint", accent: "#CE1141", bg: "#A00D33" },
  { name: "Mookie Betts",        team: "LAD", year: "2014", set: "Bowman Chrome",  grade: 10, gradeLabel: "Gem Mint", accent: "#1d6fb5", bg: "#003f8a" },
  { name: "Aaron Judge",         team: "NYY", year: "2017", set: "Topps Chrome",   grade: 10, gradeLabel: "Gem Mint", accent: "#6fa8dc", bg: "#002F6C" },
  { name: "Juan Soto",           team: "NYM", year: "2018", set: "Topps Update",   grade: 10, gradeLabel: "Gem Mint", accent: "#6fa8dc", bg: "#003087" },
  { name: "Bryce Harper",        team: "PHI", year: "2012", set: "Topps Chrome",   grade: 10, gradeLabel: "Gem Mint", accent: "#E81828", bg: "#C01020" },
  { name: "Fernando Tatis Jr.",  team: "SD",  year: "2019", set: "Topps Chrome",   grade: 10, gradeLabel: "Gem Mint", accent: "#ffc425", bg: "#4a3728" },
  { name: "Julio Rodríguez",    team: "SEA", year: "2022", set: "Topps Series 1", grade: 10, gradeLabel: "Gem Mint", accent: "#00b5b8", bg: "#00535A" },
  { name: "Freddie Freeman",     team: "LAD", year: "2011", set: "Topps Update",   grade:  9, gradeLabel: "Mint",     accent: "#1d6fb5", bg: "#003f8a" },
  { name: "Corbin Carroll",      team: "ARI", year: "2023", set: "Topps Chrome",   grade: 10, gradeLabel: "Gem Mint", accent: "#E3D4AD", bg: "#8B1A2E" },
  { name: "Bobby Witt Jr.",      team: "KC",  year: "2022", set: "Topps Series 1", grade: 10, gradeLabel: "Gem Mint", accent: "#74B2E2", bg: "#004B8D" },
];

const CARD_W = 200;
const CARD_H = 280;
const CARD_GAP = 20;
const PITCH = CARD_W + CARD_GAP;

/* ── Card placeholder ── */
function ShowcaseCard({
  card,
  isActive,
  index,
}: {
  card: CardEntry;
  isActive: boolean;
  index: number;
}) {
  const initials = card.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3);

  const scanDelay = `${(index % 4) + 1}s`;

  return (
    <motion.div
      animate={{
        scale: isActive ? 1 : 0.88,
        opacity: isActive ? 1 : 0.55,
        y: isActive ? -6 : 4,
      }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className="relative flex-shrink-0 rounded-xl overflow-hidden cursor-pointer select-none"
      style={{
        width: CARD_W,
        height: CARD_H,
        background: `linear-gradient(160deg, ${card.bg} 0%, ${card.bg}cc 50%, #050d1e 100%)`,
        boxShadow: isActive
          ? `0 24px 64px rgba(0,0,0,0.7), 0 0 40px ${card.accent}25, 0 0 0 1px rgba(255,255,255,0.08)`
          : "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* Inner border ring */}
      <div
        className="absolute inset-[3px] rounded-lg pointer-events-none"
        style={{ border: `1px solid rgba(255,255,255,0.09)` }}
      />

      {/* Accent glow at top — team color */}
      <div
        className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${card.accent}30, transparent)`,
        }}
      />

      {/* Holographic sheen (active cards only) */}
      {isActive && (
        <div
          className="absolute inset-0 card-sheen pointer-events-none"
          style={{ "--sheen-delay": scanDelay } as CSSProperties}
        />
      )}

      {/* Scan-line shimmer (active cards only) */}
      {isActive && (
        <div
          className="scan-line-shimmer"
          style={{ "--scan-delay": scanDelay } as CSSProperties}
        />
      )}

      {/* Top bar: set + year */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <span
          className="text-[9px] font-bold tracking-wider uppercase"
          style={{ color: `${card.accent}cc` }}
        >
          {card.set}
        </span>
        <span className="text-[9px] font-semibold text-white/35">
          {card.year}
        </span>
      </div>

      {/* Center: initials avatar */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative w-[76px] h-[76px] rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle, ${card.accent}22 0%, transparent 70%)`,
            border: `1px solid ${card.accent}30`,
          }}
        >
          {/* Outer ring */}
          <div
            className="absolute inset-[-6px] rounded-full"
            style={{ border: `1px solid ${card.accent}15` }}
          />
          <span
            className="text-3xl font-black tracking-tight"
            style={{ color: `${card.accent}90` }}
          >
            {initials}
          </span>
        </div>
      </div>

      {/* Team badge */}
      <div className="absolute top-3 right-3">
        <span
          className="text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded"
          style={{
            background: `${card.accent}20`,
            border: `1px solid ${card.accent}35`,
            color: `${card.accent}dd`,
          }}
        >
          {card.team}
        </span>
      </div>

      {/* Bottom info */}
      <div
        className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)",
        }}
      >
        <p className="text-white font-bold text-sm leading-tight truncate">
          {card.name}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <Award size={9} className="text-white/30 flex-shrink-0" />
          <span className="grade-badge">
            {card.grade} {card.gradeLabel}
          </span>
        </div>
        <span className="mt-1.5 inline-flex items-center gap-1 text-[8px] text-white/28 tracking-wide uppercase font-medium">
          <span
            className="w-1 h-1 rounded-full"
            style={{ background: card.accent, opacity: 0.6 }}
          />
          Cropped + Oriented
        </span>
      </div>
    </motion.div>
  );
}

/* ── Showcase Dashboard ── */
export default function ShowcaseDashboard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [containerW, setContainerW] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const touchStartX = useRef(0);

  const next = useCallback(
    () => setActiveIndex((i) => (i + 1) % CARDS.length),
    []
  );
  const prev = useCallback(
    () => setActiveIndex((i) => (i - 1 + CARDS.length) % CARDS.length),
    []
  );

  /* Measure container */
  useEffect(() => {
    const update = () => {
      if (containerRef.current)
        setContainerW(containerRef.current.clientWidth);
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  /* Auto-advance */
  useEffect(() => {
    if (isPaused) return;
    autoRef.current = setInterval(next, 4200);
    return () => clearInterval(autoRef.current);
  }, [isPaused, next]);

  /* Transform: center active card in viewport */
  const trackX =
    containerW > 0
      ? containerW / 2 - CARD_W / 2 - activeIndex * PITCH
      : 0;

  return (
    <section className="relative z-10 px-4 py-6 sm:py-10">
      <div className="max-w-2xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-center mb-5"
        >
          <p className="text-[11px] font-semibold text-white/30 tracking-widest uppercase mb-1">
            Showcase
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-white/90 tracking-tight">
            Premium Card Gallery
          </h2>
          <p className="text-xs text-white/35 mt-1">
            Auto-cropped, oriented, and graded
          </p>
        </motion.div>

        {/* Dashboard frame */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.55 }}
          className="glass-showcase rounded-2xl p-4 sm:p-5 relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
            setIsPaused(true);
          }}
          onTouchEnd={(e) => {
            const delta = touchStartX.current - e.changedTouches[0].clientX;
            if (Math.abs(delta) > 38) {
              if (delta > 0) next();
              else prev();
            }
            setIsPaused(false);
          }}
        >
          {/* Top status bar */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#4ade80]"
                style={{ boxShadow: "0 0 6px #4ade80" }}
              />
              <span className="text-[10px] text-white/30 font-medium">
                {CARDS.length} cards · PSA certified
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#C8102E]/60" />
              <div className="w-2 h-2 rounded-full bg-amber-400/40" />
              <div className="w-2 h-2 rounded-full bg-[#4ade80]/40" />
            </div>
          </div>

          {/* Carousel viewport */}
          <div
            ref={containerRef}
            className="relative overflow-hidden"
            style={{ height: CARD_H + 24 }}
          >
            {/* Fade masks — left and right edges */}
            <div
              className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,14,38,0.8), transparent)",
              }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to left, rgba(0,14,38,0.8), transparent)",
              }}
            />

            {/* Sliding track */}
            <motion.div
              className="absolute flex items-center"
              style={{ gap: CARD_GAP, top: 12, bottom: 0, left: 0 }}
              animate={{ x: trackX }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 36,
                mass: 1.1,
              }}
            >
              {CARDS.map((card, i) => (
                <ShowcaseCard
                  key={card.name}
                  card={card}
                  isActive={i === activeIndex}
                  index={i}
                />
              ))}
            </motion.div>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between mt-4 px-1">
            {/* Prev / Next */}
            <div className="flex gap-2">
              <button
                onClick={prev}
                aria-label="Previous card"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all duration-200 active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={next}
                aria-label="Next card"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all duration-200 active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Pagination dots */}
            <div className="flex items-center gap-1.5 flex-wrap justify-end max-w-[160px]">
              {CARDS.map((card, i) => (
                <button
                  key={card.name}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Card ${i + 1}`}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: i === activeIndex ? 22 : 6,
                    height: 6,
                    background:
                      i === activeIndex
                        ? "#C8102E"
                        : "rgba(255,255,255,0.18)",
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
