"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function CricketAnimation() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute bottom-[16%] left-[18%] h-24 w-24 opacity-70 sm:bottom-[18%] sm:left-[22%] md:h-32 md:w-32">
        <div className="absolute bottom-2 left-1/2 h-24 w-2 -translate-x-1/2 rotate-[28deg] rounded-full bg-gradient-to-b from-amber-100 via-amber-300 to-amber-700 shadow-[0_0_24px_rgba(242,184,92,0.28)] md:h-32 md:w-3" />
        <div className="absolute bottom-0 left-1/2 h-7 w-3 -translate-x-1/2 translate-y-4 rounded-full bg-[#55311f] md:h-9 md:w-4" />
      </div>

      {prefersReducedMotion ? (
        <div className="absolute bottom-[49%] left-[38%] h-3 w-3 rounded-full bg-[#d94a38] shadow-[0_0_20px_rgba(217,74,56,0.65)] md:bottom-[45%] md:left-[40%] md:h-4 md:w-4" />
      ) : (
        <motion.div
          className="absolute bottom-[28%] left-[26%] h-3 w-3 rounded-full bg-[#d94a38] shadow-[0_0_20px_rgba(217,74,56,0.65)] md:h-4 md:w-4"
          animate={{
            x: [0, 80, 190, 260],
            y: [0, -35, -150, -220],
            scale: [1, 1.15, 0.9, 0.55],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 3.8,
            repeat: Infinity,
            repeatDelay: 1.6,
            ease: "easeOut",
            times: [0, 0.16, 0.62, 1],
          }}
        />
      )}

      {!prefersReducedMotion ? (
        <motion.div
          className="absolute bottom-[21%] left-[17%] h-24 w-24 origin-bottom opacity-70 sm:bottom-[23%] sm:left-[21%] md:h-32 md:w-32"
          animate={{ rotate: [18, 18, -22, 18] }}
          transition={{
            duration: 3.8,
            repeat: Infinity,
            repeatDelay: 1.6,
            ease: "easeInOut",
            times: [0, 0.4, 0.55, 0.72],
          }}
        >
          <div className="absolute bottom-2 left-1/2 h-24 w-2 -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-100 via-amber-300 to-amber-700 shadow-[0_0_24px_rgba(242,184,92,0.28)] md:h-32 md:w-3" />
        </motion.div>
      ) : null}
    </div>
  );
}
