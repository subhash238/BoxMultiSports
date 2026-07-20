import { Variants } from "framer-motion";

export const primaryButton: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,

    transition: {
      duration: 0.6,
      ease: "easeOut",
      delay: 0.8,
    },
  },

  hover: {
    scale: 1.05,
    y: -3,

    transition: {
      duration: 0.25,
    },
  },

  tap: {
    scale: 0.97,
  },
};

export const secondaryButton: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.6,
      ease: "easeOut",
      delay: 1,
    },
  },

  hover: {
    scale: 1.05,
    backgroundColor: "rgba(255,255,255,0.1)",

    transition: {
      duration: 0.25,
    },
  },

  tap: {
    scale: 0.97,
  },
};