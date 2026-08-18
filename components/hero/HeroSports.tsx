"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/animations/hero.animation";
import { SHARED_BOOKING_SPORT_SLUGS } from "@/components/booking-widget/constants";

type HeroSport = {
  slug: string;
  name: string;
  isActive?: boolean;
};

const SPORT_DISPLAY_NAMES: Record<string, string> = {
  cricket: "Cricket",
  football: "Football",
  pickleball: "Pickleball",
  badminton: "Badminton",
  "net-practice": "Net Practice",
};

const SPORT_ICONS: Record<string, string> = {
  cricket: "🏏",
  football: "⚽",
  pickleball: "🎾",
  badminton: "🏸",
  "net-practice": "🥅",
};

interface HeroSportsProps {
  selectedSportSlug?: string | null;
  onSportSelect?: (slug: string) => void;
}

export default function HeroSports({
  selectedSportSlug,
  onSportSelect,
}: HeroSportsProps) {
  const [sports, setSports] = useState<HeroSport[]>([]);

  useEffect(() => {
    let active = true;

    async function loadSports() {
      try {
        const response = await fetch("/api/sports", {
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          return;
        }

        const approvedSports = (result.sports ?? []).filter(
          (sport: HeroSport) =>
            sport.isActive !== false &&
            SHARED_BOOKING_SPORT_SLUGS.includes(
              sport.slug as (typeof SHARED_BOOKING_SPORT_SLUGS)[number]
            )
        );

        if (active) {
          setSports(approvedSports);
        }
      } catch {
        if (active) {
          setSports([]);
        }
      }
    }

    void loadSports();

    return () => {
      active = false;
    };
  }, []);

  return (
    <motion.div
      variants={fadeUp}
      className="mt-16 flex max-w-full flex-wrap justify-center gap-3 sm:gap-5"
    >
      {sports.map((sport) => {
        const isSelected = selectedSportSlug === sport.slug;

        return (
          <motion.button
            key={sport.slug}
            type="button"
            onClick={() => onSportSelect?.(sport.slug)}
            whileHover={{ scale: 1.08, y: -5 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.25 }}
            aria-pressed={isSelected}
            aria-label={`Select ${SPORT_DISPLAY_NAMES[sport.slug] ?? sport.name}`}
            className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 py-3 text-white backdrop-blur-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B6F000] sm:px-6 ${
              isSelected
                ? "border-[#B6F000] bg-[#B6F000]/20 text-[#B6F000] shadow-[0_0_25px_rgba(182,240,0,0.35)]"
                : "border-white/10 bg-white/10 hover:border-[#B6F000] hover:bg-[#B6F000]/10 hover:shadow-[0_0_25px_rgba(182,240,0,0.35)]"
            }`}
          >
            <span className="text-xl" aria-hidden="true">
              {SPORT_ICONS[sport.slug]}
            </span>
            <span className="font-medium">
              {SPORT_DISPLAY_NAMES[sport.slug] ?? sport.name}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
