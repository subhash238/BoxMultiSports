"use client";

import { motion, useReducedMotion } from "framer-motion";

function Racket() {
  return (
    <div className="absolute bottom-0 left-1/2 h-24 w-16 -translate-x-1/2 md:h-32 md:w-20">
      <div className="absolute bottom-8 left-1/2 h-14 w-12 -translate-x-1/2 rounded-[50%] border-2 border-sky-100/80 bg-[repeating-linear-gradient(45deg,transparent_0_4px,rgba(186,230,253,0.22)_5px_6px)] shadow-[0_0_18px_rgba(125,211,252,0.22)] md:bottom-11 md:h-20 md:w-16" />
      <div className="absolute bottom-0 left-1/2 h-10 w-2 -translate-x-1/2 rotate-[8deg] rounded-full bg-gradient-to-b from-amber-100 to-amber-600 md:h-14 md:w-3" />
    </div>
  );
}

function Shuttle() {
  return (
    <div className="relative h-7 w-6 md:h-9 md:w-8">
      <div className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-amber-100 shadow-[0_0_10px_rgba(254,243,199,0.6)] md:h-3 md:w-3" />
      <div className="absolute left-1/2 top-0 h-6 w-5 -translate-x-1/2 border-x-[7px] border-b-[10px] border-x-transparent border-b-sky-100/80 md:h-8 md:w-7 md:border-x-[9px] md:border-b-[13px]" />
    </div>
  );
}

export default function BadmintonAnimation() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {prefersReducedMotion ? (
        <div className="absolute bottom-[19%] left-[17%] opacity-90 sm:left-[22%]">
          <Racket />
          <div className="absolute bottom-28 left-[14vw] md:bottom-36 md:left-[17vw]">
            <Shuttle />
          </div>
        </div>
      ) : (
        <motion.div
          className="absolute bottom-[19%] left-[17%] opacity-90 sm:left-[22%]"
          animate={{ rotate: [8, 8, -7, 8] }}
          transition={{ duration: 5.6, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut", times: [0, 0.38, 0.5, 0.66] }}
        >
          <Racket />
        </motion.div>
      )}

      {prefersReducedMotion ? null : (
        <motion.div
          className="absolute bottom-[39%] left-[29%]"
          animate={{
            x: [0, 66, 132, 182, 232],
            y: [0, 24, 4, -70, -122],
            rotate: [0, 80, 165, 255, 330],
            opacity: [0, 1, 1, 1, 0.7],
          }}
          transition={{ duration: 5.6, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut", times: [0, 0.24, 0.4, 0.7, 1] }}
        >
          <Shuttle />
        </motion.div>
      )}
    </div>
  );
}
