"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function FootballAnimation() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute bottom-[14%] left-0 z-[1] text-[3.25rem] leading-none opacity-95 drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] md:text-[4.5rem]">
        {prefersReducedMotion ? (
          <span className="absolute left-[80vw]">⚽</span>
        ) : (
          <motion.span
            className="block"
            initial={{ x: "-18vw", y: -16, rotate: 0 }}
            animate={{
              x: ["-18vw", "-7vw", "4vw", "15vw", "25vw", "35vw", "45vw", "54vw", "62vw", "68vw", "73vw", "77vw", "80vw"],
              y: [-18, 0, -128, 0, -84, 0, -46, 0, -20, 0, -8, 0, 0],
              rotate: [0, 90, 190, 290, 390, 480, 570, 650, 720, 780, 825, 855, 870],
            }}
            transition={{
              duration: 6.2,
              times: [0, 0.1, 0.2, 0.32, 0.42, 0.53, 0.63, 0.72, 0.8, 0.87, 0.93, 0.97, 1],
              ease: "easeInOut",
            }}
          >
            ⚽
          </motion.span>
        )}
      </div>
    </div>
  );
}
