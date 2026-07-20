export const fadeUp = {
  hidden: {
    opacity: 0,
    y: 60,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

export const fadeIn = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,

    transition: {
      duration: 1,
    },
  },
};

export const floating = {
  animate: {
    y: [0, -8, 0],

    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};