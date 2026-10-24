"use client";

import { ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  Variants,
  Transition,
} from "framer-motion";

/**
 * Shared animation primitives used across every
 * public page so motion feels consistent on
 * mobile, tablet and desktop. All reveal
 * animations trigger on scroll (IntersectionObserver)
 * and respect the OS "reduce motion" setting by
 * falling back to a plain fade.
 */

const EASE: Transition["ease"] = [0.22, 1, 0.36, 1];
const VIEWPORT = { once: true, amount: 0.15 } as const;

export function useFadeUp(y = 32, blur = true) {
  const reduce = useReducedMotion();
  return {
    hidden: {
      opacity: 0,
      y: reduce ? 0 : y,
      filter: reduce || !blur ? "blur(0px)" : "blur(10px)",
    },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
    },
  } satisfies Variants;
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  /** Animate on mount instead of waiting for scroll. */
  immediate?: boolean;
  blur?: boolean;
}

export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.75,
  y = 32,
  immediate = false,
  blur = true,
}: RevealProps) {
  const variants = useFadeUp(y, blur);
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      {...(immediate
        ? { animate: "show" }
        : { whileInView: "show", viewport: VIEWPORT })}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  immediate?: boolean;
}

export function Stagger({
  children,
  className,
  stagger = 0.09,
  delay = 0.05,
  immediate = false,
}: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      {...(immediate
        ? { animate: "show" }
        : { whileInView: "show", viewport: VIEWPORT })}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  y?: number;
  /** Lift + scale on hover, press-down on tap. */
  lift?: boolean;
}

export function StaggerItem({
  children,
  className,
  y = 28,
  lift = false,
}: StaggerItemProps) {
  const variants = useFadeUp(y);
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={variants}
      transition={{ duration: 0.65, ease: EASE }}
      {...(lift && !reduce
        ? {
            whileHover: { y: -6, scale: 1.02 },
            whileTap: { scale: 0.98 },
          }
        : {})}
    >
      {children}
    </motion.div>
  );
}

export function HoverLift({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      whileHover={reduce ? undefined : { y: -6, scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Headline that slides in word by word.
 */
export function TextReveal({
  text,
  className,
  delay = 0,
  as: Tag = "h1",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const MotionTag = motion[Tag];
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.07, delayChildren: delay } },
      }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: reduce ? 0 : "110%", opacity: 0 },
              show: { y: 0, opacity: 1 },
            }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </MotionTag>
  );
}

/**
 * Slow drifting background glow.
 */
export function FloatingBlob({
  className,
  duration = 12,
}: {
  className?: string;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className={className}
      animate={
        reduce
          ? undefined
          : { x: [0, 40, -30, 0], y: [0, -30, 25, 0], scale: [1, 1.15, 0.95, 1] }
      }
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/**
 * Route-change transition used by app/template.tsx.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="page-transition flex flex-1 flex-col"
      initial={{ opacity: 0, y: reduce ? 0 : 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
