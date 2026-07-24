"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "@/animations/hero.animation";

const sports = [
  {
    name: "Football",
    icon: "⚽",
    href: "/football",
  },
  {
    name: "Box Cricket",
    icon: "🏏",
    href: "/box-cricket",
  },
  {
    name: "Badminton",
    icon: "🏸",
    href: "/badminton",
  },
  {
    name: "Basketball",
    icon: "🏀",
    href: "/basketball",
  },
  {
    name: "Rugby",
    icon: "🏉",
    href: "/rugby",
  },
  {
    name: "Baseball",
    icon: "⚾",
    href: "/baseball",
  },
];

export default function HeroSports() {
  return (
    <motion.div
      variants={fadeUp}
      className="mt-16 flex flex-wrap justify-center gap-5"
    >
      {sports.map((sport) => (
        <Link
          key={sport.name}
          href={sport.href}
          className="group"
        >
          <motion.button
            type="button"
            whileHover={{
              scale: 1.08,
              y: -5,
            }}
            whileTap={{
              scale: 0.96,
            }}
            transition={{
              duration: 0.25,
            }}
            className="
              flex
              cursor-pointer
              items-center
              gap-2
              rounded-full
              border
              border-white/10
              bg-white/10
              px-6
              py-3
              text-white
              backdrop-blur-xl
              transition-all
              duration-300
              hover:border-[#B6F000]
              hover:bg-[#B6F000]/10
              hover:shadow-[0_0_25px_rgba(182,240,0,0.35)]
            "
          >
            <span className="text-xl">
              {sport.icon}
            </span>

            <span className="font-medium transition-colors duration-300 group-hover:text-[#B6F000]">
              {sport.name}
            </span>
          </motion.button>
        </Link>
      ))}
    </motion.div>
  );
}