"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/animations/hero.animation";

export default function HeroButtons() {
  return (
    <motion.div
      variants={fadeUp}
      className="mt-12 flex flex-wrap justify-center gap-5"
    >
      <button className="rounded-xl bg-text-lime-400 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-text-lime-300">
        Book Your Slot
      </button>

      <button className="rounded-xl border border-text-lime-400 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-text-lime-400 hover:text-black">
        Explore Arena
      </button>
    </motion.div>
  );
}