"use client";

import { motion, useReducedMotion } from "framer-motion";

function PracticeNet({ reacts }: { reacts: boolean }) {
  const net = (
    <div className="absolute right-[7%] top-[23%] h-[52%] w-[32%] rounded-l-[35%] border-l border-t border-white/15 bg-[repeating-linear-gradient(90deg,rgba(180,220,190,0.12)_0_1px,transparent_1px_18px),repeating-linear-gradient(0deg,rgba(180,220,190,0.1)_0_1px,transparent_1px_18px)] opacity-70 [transform:perspective(480px)_rotateY(-16deg)] md:right-[10%] md:w-[28%]" />
  );

  return reacts ? (
    <motion.div
      animate={{ x: [0, 1.5, 0], opacity: [0.68, 0.88, 0.68] }}
      transition={{ duration: 3.8, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }}
    >
      {net}
    </motion.div>
  ) : (
    net
  );
}

export default function NetPracticeAnimation() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(180deg,transparent,rgba(31,91,50,0.28))]" />
      <PracticeNet reacts={!prefersReducedMotion} />

      {prefersReducedMotion ? (
        <div className="absolute bottom-[25%] left-[26%] h-3 w-3 rounded-full bg-[#b93432] shadow-[0_0_14px_rgba(185,52,50,0.55)] md:h-4 md:w-4" />
      ) : (
        <motion.div
          className="absolute bottom-[25%] left-[12%] h-3 w-3 rounded-full bg-[#b93432] shadow-[0_0_14px_rgba(185,52,50,0.55)] md:h-4 md:w-4"
          animate={{
            x: [0, 58, 124, 186, 226],
            y: [0, -28, -68, -38, 0],
            rotate: [0, 100, 220, 340, 450],
            opacity: [0, 1, 1, 1, 0.75],
          }}
          transition={{ duration: 4.6, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut", times: [0, 0.2, 0.46, 0.76, 1] }}
        />
      )}
    </div>
  );
}
