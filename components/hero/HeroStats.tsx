"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/animations/hero.animation";

const stats = [
  {
    value: "★★★★★",
    label: "4.9 Rating",
  },
  {
    value: "5000+",
    label: "Happy Players",
  },
  {
    value: "8+",
    label: "Sports",
  },
  {
    value: "365",
    label: "Days Open",
  },
];

export default function HeroStats() {
  return (
    <motion.div
      variants={fadeUp}
      className="mt-20 grid w-full max-w-5xl grid-cols-2 gap-8 border-t border-white/20 pt-10 md:grid-cols-4"
    >
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <h3 className="text-4xl font-bold text-orange-500">
            {stat.value}
          </h3>

          <p className="mt-2 text-gray-300">
            {stat.label}
          </p>
        </div>
      ))}
    </motion.div>
  );
}