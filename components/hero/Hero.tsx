import { motion } from "framer-motion";
import HeroSports from "./HeroSports";
import { fadeUp, fadeIn, floating } from "@/animations/hero.animation";
export default function Hero() {
  return (
    <section
      className="relative min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center text-white">

        {/* Premium Badge */}
        <span className="rounded-full border border-text-lime-400 bg-text-lime-400/10 px-6 py-2 text-sm font-semibold uppercase tracking-[4px] text-text-lime-400">
          Premium Multi-Sports Arena
        </span>

        {/* Main Heading */}
        <h1 className="mt-8 text-5xl font-extrabold leading-tight md:text-7xl">
          THE ULTIMATE
          <br />
          SPORTS EXPERIENCE
        </h1>

        {/* Tagline */}
        <h2 className="mt-6 text-xl font-semibold tracking-[6px] text-text-lime-400 md:text-2xl">
          PLAY • TRAIN • COMPETE
        </h2>

        {/* Description */}
        <p className="mt-8 max-w-3xl text-lg leading-8 text-gray-300">
          Experience world-class sports facilities crafted for players,
          families and future champions.
        </p>

        {/* Buttons */}
        <div className="mt-12 flex flex-wrap justify-center gap-5">

          <button className="rounded-xl bg-text-lime-400 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:bg-text-lime-300">
            Book Your Slot
          </button>

          <button className="rounded-xl border border-text-lime-400 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:bg-text-lime-400 hover:text-black">
            Explore Arena
          </button>

        </div>
        <div>
        {/* Sports */}
        <HeroSports />
          
        </div>

        {/* Statistics */}
        <div className="mt-20 grid w-full max-w-5xl grid-cols-2 gap-8 border-t border-white/20 pt-10 md:grid-cols-4">

          <div>
            <h3 className="text-4xl font-bold text-text-lime-400">
              ★★★★★
            </h3>
            <p className="mt-2 text-gray-300">
              4.9 Rating
            </p>
          </div>

          <div>
            <h3 className="text-4xl font-bold text-text-lime-400">
              5000+
            </h3>
            <p className="mt-2 text-gray-300">
              Happy Players
            </p>
          </div>

          <div>
            <h3 className="text-4xl font-bold text-text-lime-400">
              8+
            </h3>
            <p className="mt-2 text-gray-300">
              Sports
            </p>
          </div>

          <div>
            <h3 className="text-4xl font-bold text-text-lime-400">
              365
            </h3>
            <p className="mt-2 text-gray-300">
              Days Open
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}