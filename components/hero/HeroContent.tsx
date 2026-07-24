"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/animations/hero.animation";

import HeroButtons from "./HeroButtons";
import HeroSports from "./HeroSports";
import HeroStats from "./HeroStats";

export default function HeroContent() {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center text-white">
      {/* Premium Badge */}
      <motion.span
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-full border border-orange-500 bg-orange-500/10 px-6 py-2 text-sm font-semibold uppercase tracking-[4px] text-orange-400"
      >
        Premium Multi-Sports Arena
      </motion.span>

      {/* Heading */}
      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-8 text-5xl font-extrabold leading-tight md:text-7xl"
      >
        THE ULTIMATE
        <br />
        SPORTS EXPERIENCE
      </motion.h1>

      {/* Subtitle */}
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-6 text-xl font-semibold tracking-[6px] text-orange-400 md:text-2xl"
      >
        PLAY • TRAIN • COMPETE
      </motion.h2>

      {/* Description */}
      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-8 max-w-3xl text-lg leading-8 text-gray-300"
      >
        Experience world-class sports facilities crafted for players,
        families and future champions.
      </motion.p>

      {/* CTA Buttons */}
      <HeroButtons />

      {/* Sports */}
      <HeroSports />

      {/* Statistics */}
      <HeroStats />
    </div>
  );
}