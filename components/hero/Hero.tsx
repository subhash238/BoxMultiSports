"use client";

import { motion } from "framer-motion";
import HeroSports from "./HeroSports";
import CricketAnimation from "./animations/CricketAnimation";
import FootballAnimation from "./animations/FootballAnimation";
import PickleballAnimation from "./animations/PickleballAnimation";
import BadmintonAnimation from "./animations/BadmintonAnimation";
import NetPracticeAnimation from "./animations/NetPracticeAnimation";
import { fadeUp, fadeIn, floating } from "@/animations/hero.animation";

interface HeroProps {
  selectedSportSlug: string | null;
  onSportSelect: (slug: string) => void;
  heroImageUrl?: string | null;
}

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
      <section
      className="relative min-h-screen overflow-hidden bg-[#102519] bg-cover bg-center"
      style={{
        backgroundImage: heroImageUrl
          ? `url("${heroImageUrl}")`
          : undefined, }}
      >
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

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center text-white">

        {/* Premium Badge */}
        <span className="rounded-full border border-text-lime-400 bg-text-lime-400/10 px-6 py-2 text-sm font-semibold uppercase tracking-[4px] text-text-lime-400">
          Premium Multi-Sports Arena
        </span>

        {/* Main Heading */}
        <h1 className="mt-8 text-5xl font-extrabold leading-tight md:text-7xl">
          THE ULTIMATE
          <br />
          SPORTS EXPERIENCE
        </h1>

        {/* Tagline */}
        <h2 className="mt-6 text-xl font-semibold tracking-[6px] text-text-lime-400 md:text-2xl">
          PLAY • TRAIN • COMPETE
        </h2>

        {/* Description */}
        <p className="mt-8 max-w-3xl text-lg leading-8 text-gray-300">
          Experience world-class sports facilities crafted for players,
          families and future champions.
        </p>

        {/* Buttons */}
        <div className="mt-12 flex flex-wrap justify-center gap-5">

          <button className="rounded-xl border border-text-lime-400 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:bg-text-lime-400 hover:text-black">
            Explore Arena
          </button>

        </div>
        <div>
        {/* Sports */}
        <HeroSports
          selectedSportSlug={selectedSportSlug}
          onSportSelect={onSportSelect}
        />
          
        </div>

        {/* Statistics */}
        <div className="mt-20 grid w-full max-w-5xl grid-cols-2 gap-8 border-t border-white/20 pt-10 md:grid-cols-4">

          <div>
            <h3 className="text-4xl font-bold text-yellow-400">
              ★★★★★
            </h3>
            <p className="mt-2 text-gray-300">
              4.9 Rating
            </p>
          </div>

          <div>
            <h3 className="text-4xl font-bold text-text-lime-400">
              5000+
            </h3>
            <p className="mt-2 text-gray-300">
              Happy Players
            </p>
          </div>

          <div>
            <h3 className="text-4xl font-bold text-text-lime-400">
              8+
            </h3>
            <p className="mt-2 text-gray-300">
              Sports
            </p>
          </div>

          <div>
            <h3 className="text-4xl font-bold text-text-lime-400">
              365
            </h3>
            <p className="mt-2 text-gray-300">
              Days Open
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
