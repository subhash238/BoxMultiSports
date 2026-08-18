"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";

import GymBookingWidget from "@/components/gym/GymBookingWidget";

const highlights = [
  { value: "₹399", label: "per person / day" },
  { value: "06:00–23:00", label: "daily access window" },
  { value: "25", label: "simultaneous participants" },
  { value: "Secure", label: "online booking" },
];

const experiences = [
  {
    number: "01",
    title: "Strength & Conditioning",
    text: "A focused session format built around the way you want to train.",
  },
  {
    number: "02",
    title: "Flexible Training Hours",
    text: "Choose a morning, afternoon, or evening window that fits your rhythm.",
  },
  {
    number: "03",
    title: "Capacity-Aware Booking",
    text: "Shared capacity is checked for your selected time before confirmation.",
  },
  {
    number: "04",
    title: "Focused Environment",
    text: "Keep your session intentional, efficient, and easy to plan.",
  },
];

export default function GymPage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <main className="min-h-screen overflow-hidden bg-[#080909] text-white">
      <section className="relative isolate border-b border-white/[0.08] px-5 pb-16 pt-10 sm:px-8 md:pb-24 md:pt-16">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_74%_18%,rgba(182,240,0,0.16),transparent_30%),linear-gradient(135deg,#080909_0%,#111514_48%,#090a0a_100%)]" />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-10 -z-10 h-80 w-80 rounded-full bg-[#B6F000]/10 blur-3xl"
          animate={
            prefersReducedMotion
              ? undefined
              : { x: [0, -24, 0], y: [0, 18, 0], opacity: [0.45, 0.7, 0.45] }
          }
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.55 }}
          >
            <p className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-[#B6F000]">
              <span className="h-px w-10 bg-[#B6F000]" /> Uniturf Gym
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.05em] sm:text-7xl">
              Train stronger.
              <span className="block text-white/45">Move better.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/60 sm:text-lg">
              Book your Gym session from morning to evening with capacity-aware access built into every reservation.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="#gym-booking"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#B6F000] px-7 text-sm font-black uppercase tracking-[0.12em] text-[#10130b] shadow-[0_0_34px_rgba(182,240,0,0.18)] transition duration-200 hover:-translate-y-1 hover:bg-[#c8ff2e] hover:shadow-[0_0_42px_rgba(182,240,0,0.3)] focus:outline-none focus:ring-2 focus:ring-[#B6F000] focus:ring-offset-2 focus:ring-offset-[#080909] active:translate-y-0"
              >
                Book Your Workout
              </Link>
              <span className="text-sm text-white/45">One session. Your pace.</span>
            </div>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.65, delay: 0.08 }}
            className="relative min-h-[320px] overflow-hidden rounded-[2rem] border border-white/[0.12] bg-gradient-to-br from-[#252c2a] via-[#111716] to-[#0b0c0c] p-7 shadow-2xl sm:min-h-[390px] sm:p-10"
          >
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:42px_42px]" />
            <div className="absolute -bottom-24 -right-12 h-64 w-64 rounded-full border border-[#B6F000]/30 bg-[#B6F000]/10 blur-sm" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/45">Performance zone</span>
                <span className="rounded-full border border-[#B6F000]/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B6F000]">Ready</span>
              </div>
              <div className="py-12">
                <p className="text-7xl font-black tracking-[-0.08em] text-white/90 sm:text-8xl">GYM</p>
                <p className="mt-3 max-w-xs text-sm leading-6 text-white/45">A sharper way to schedule time for the work that matters.</p>
              </div>
              <div className="flex items-end justify-between border-t border-white/10 pt-5">
                <span className="text-xs uppercase tracking-[0.2em] text-white/40">UniTurf / 01</span>
                <span className="text-3xl font-black text-[#B6F000]">399<span className="ml-1 text-sm font-semibold text-[#B6F000]/70">INR</span></span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-white/[0.08] px-5 py-8 sm:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.1] sm:grid-cols-4">
          {highlights.map((item, index) => (
            <motion.div
              key={item.label}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : index * 0.06, duration: prefersReducedMotion ? 0 : 0.3 }}
              className="bg-[#111313] p-5 sm:p-6"
            >
              <p className="text-xl font-black tracking-tight text-[#B6F000] sm:text-2xl">{item.value}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#B6F000]">The experience</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Built around your training.</h2>
            <p className="mt-5 leading-7 text-white/55">Everything you need to make the most of your chosen window, with a simple booking experience that respects your time.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {experiences.map((item) => (
              <motion.article
                key={item.number}
                whileHover={prefersReducedMotion ? undefined : { y: -5 }}
                transition={{ duration: 0.2 }}
                className="group rounded-2xl border border-white/[0.1] bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 transition-colors hover:border-[#B6F000]/35"
              >
                <span className="text-xs font-bold tracking-[0.2em] text-[#B6F000]/70">{item.number}</span>
                <h3 className="mt-12 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/50">{item.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="gym-booking" className="scroll-mt-32 border-t border-white/[0.08] px-5 py-16 sm:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#B6F000]">Reserve your window</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Make the session yours.</h2>
            <p className="mt-5 leading-7 text-white/55">Select your time and participant count. Shared Gym capacity is checked for your selected time.</p>
          </div>
          <GymBookingWidget />
        </div>
      </section>
    </main>
  );
}
