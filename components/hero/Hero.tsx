"use client";

import { motion } from "framer-motion";
import HeroSports from "./HeroSports";
import CricketAnimation from "./animations/CricketAnimation";
import FootballAnimation from "./animations/FootballAnimation";
import PickleballAnimation from "./animations/PickleballAnimation";
import BadmintonAnimation from "./animations/BadmintonAnimation";
import NetPracticeAnimation from "./animations/NetPracticeAnimation";

interface HeroProps {
  selectedSportSlug: string | null;
  onSportSelect: (slug: string) => void;
  heroImageUrl?: string | null;
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stats = [
  { value: "4.9", label: "Player Rating", accent: true },
  { value: "5000+", label: "Happy Players" },
  { value: "8+", label: "Sports" },
  { value: "365", label: "Days Open" },
];

export default function Hero({
  selectedSportSlug,
  onSportSelect,
  heroImageUrl,
}: HeroProps) {
  const isCricketMode = selectedSportSlug === "cricket";
  const isFootballMode = selectedSportSlug === "football";
  const isPickleballMode = selectedSportSlug === "pickleball";
  const isBadmintonMode = selectedSportSlug === "badminton";
  const isNetPracticeMode = selectedSportSlug === "net-practice";

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#05130c]">
      {/* Background image with subtle zoom */}
      <motion.div
        key={heroImageUrl ?? "fallback"}
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: heroImageUrl ? `url("${heroImageUrl}")` : undefined,
        }}
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
      />

      {/* Cinematic overlays: bottom-heavy gradient + vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,19,12,0.55)_0%,rgba(5,19,12,0.25)_35%,rgba(5,19,12,0.85)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(3,10,7,0.75)_100%)]"
      />

      {/* Per-sport tint overlays */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_72%,rgba(242,184,92,0.24),transparent_28%),linear-gradient(135deg,rgba(43,76,38,0.48),transparent_60%)]"
        initial={false}
        animate={{ opacity: isCricketMode ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_24%,rgba(164,211,119,0.2),transparent_25%),linear-gradient(180deg,rgba(21,67,52,0.18),rgba(5,18,14,0.42))]"
        initial={false}
        animate={{ opacity: isFootballMode ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_70%,rgba(45,212,191,0.2),transparent_25%),linear-gradient(180deg,rgba(12,64,64,0.16),rgba(4,20,24,0.46))]"
        initial={false}
        animate={{ opacity: isPickleballMode ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_22%,rgba(125,211,252,0.18),transparent_25%),linear-gradient(180deg,rgba(15,62,75,0.18),rgba(4,16,28,0.46))]"
        initial={false}
        animate={{ opacity: isBadmintonMode ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_30%,rgba(148,202,124,0.16),transparent_24%),linear-gradient(180deg,rgba(24,75,42,0.16),rgba(4,18,12,0.5))]"
        initial={false}
        animate={{ opacity: isNetPracticeMode ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />

      {isCricketMode ? <CricketAnimation /> : null}
      {isFootballMode ? <FootballAnimation /> : null}
      {isPickleballMode ? <PickleballAnimation /> : null}
      {isBadmintonMode ? <BadmintonAnimation /> : null}
      {isNetPracticeMode ? <NetPracticeAnimation /> : null}

      {/* Hero Content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 pb-16 pt-28 text-center text-white"
      >
        {/* Badge */}
        <motion.span
          variants={fadeUp}
          className="inline-flex items-center gap-2.5 rounded-full border border-[#B6F000]/40 bg-[#B6F000]/10 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#B6F000] backdrop-blur-md"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#B6F000] shadow-[0_0_8px_#B6F000]" />
          Premium Multi-Sports Arena
        </motion.span>

        {/* Heading */}
        <motion.h1
          variants={fadeUp}
          className="mt-8 text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        >
          The Ultimate
          <br />
          <span className="bg-gradient-to-r from-[#B6F000] via-[#d4ff5e] to-[#B6F000] bg-clip-text text-transparent">
            Sports Experience
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          variants={fadeUp}
          className="mt-6 flex items-center gap-4 text-sm font-semibold uppercase tracking-[0.5em] text-white/60 md:text-base"
        >
          Play
          <span className="h-px w-8 bg-[#B6F000]/60" />
          Train
          <span className="h-px w-8 bg-[#B6F000]/60" />
          Compete
        </motion.p>

        {/* Description */}
        <motion.p
          variants={fadeUp}
          className="mt-7 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg"
        >
          World-class turf and indoor facilities crafted for players,
          families and future champions.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#booking"
            className="group rounded-full bg-[#B6F000] px-8 py-4 text-base font-bold text-[#05130c] shadow-[0_0_40px_rgba(182,240,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_55px_rgba(182,240,0,0.5)]"
          >
            Book Your Slot
          </a>
          <a
            href="#booking"
            className="rounded-full border border-white/25 px-8 py-4 text-base font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-[#B6F000]/60 hover:bg-white/5 hover:text-[#B6F000]"
          >
            Explore Arena
          </a>
        </motion.div>

        {/* Sport selector */}
        <motion.div variants={fadeUp}>
          <HeroSports
            selectedSportSlug={selectedSportSlug}
            onSportSelect={onSportSelect}
          />
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={fadeUp}
          className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-y-8 border-t border-white/10 pt-8 sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                {stat.accent ? (
                  <span className="text-[#B6F000]">{stat.value}</span>
                ) : (
                  stat.value
                )}
              </p>
              <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.a
        href="#booking"
        aria-label="Scroll to booking"
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/50 transition-colors hover:text-[#B6F000]"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          width="22"
          height="34"
          viewBox="0 0 22 34"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="1"
            y="1"
            width="20"
            height="32"
            rx="10"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="11" cy="10" r="2.5" fill="currentColor" />
        </svg>
      </motion.a>
    </section>
  );
}
