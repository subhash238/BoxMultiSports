"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function PickleballAnimation() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {prefersReducedMotion ? (
        <div className="absolute bottom-[17%] left-[13%] h-20 w-14 opacity-90 sm:left-[18%] md:h-28 md:w-20">
          <div className="absolute bottom-7 left-1/2 h-10 w-9 -translate-x-1/2 rounded-[45%] border-2 border-teal-100/80 bg-teal-300/20 shadow-[0_0_18px_rgba(94,234,212,0.22)] md:bottom-10 md:h-14 md:w-12" />
          <div className="absolute bottom-0 left-1/2 h-9 w-2 -translate-x-1/2 rotate-[-12deg] rounded-full bg-gradient-to-b from-amber-200 to-amber-600 md:h-12 md:w-3" />
        </div>
      ) : null}

      {prefersReducedMotion ? (
        <div className="absolute bottom-[32%] left-[42%] h-3 w-3 rounded-full bg-lime-200 shadow-[0_0_16px_rgba(190,242,100,0.7)] md:h-4 md:w-4" />
      ) : (
        <motion.div
          className="absolute bottom-[31%] left-[20%] h-3 w-3 rounded-full bg-lime-200 shadow-[0_0_16px_rgba(190,242,100,0.7)] md:h-4 md:w-4"
          animate={{
            x: [0, 50, 94, 142, 188, 214],
            y: [0, -22, -76, -45, -12, 0],
            rotate: [0, 70, 150, 230, 300, 340],
            opacity: [0, 1, 1, 1, 1, 0.75],
          }}
          transition={{
            duration: 5.4,
            repeat: Infinity,
            repeatDelay: 1.8,
            ease: "easeInOut",
            times: [0, 0.16, 0.36, 0.58, 0.78, 1],
          }}
        />
      )}

      {!prefersReducedMotion ? (
        <motion.div
          className="absolute bottom-[17%] left-[13%] h-20 w-14 origin-bottom sm:left-[18%] md:h-28 md:w-20"
          animate={{ rotate: [-12, -12, 8, -12] }}
          transition={{
            duration: 5.4,
            repeat: Infinity,
            repeatDelay: 1.8,
            ease: "easeInOut",
            times: [0, 0.35, 0.48, 0.62],
          }}
        >
          <div className="absolute bottom-7 left-1/2 h-10 w-9 -translate-x-1/2 rounded-[45%] border-2 border-teal-100/80 bg-teal-300/20 md:bottom-10 md:h-14 md:w-12" />
          <div className="absolute bottom-0 left-1/2 h-9 w-2 -translate-x-1/2 rotate-[-12deg] rounded-full bg-gradient-to-b from-amber-200 to-amber-600 md:h-12 md:w-3" />
        </motion.div>
      ) : null}
    </div>
  );
}
