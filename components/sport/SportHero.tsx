"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type SportHeroProps = {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  badge: string;
  bookingLink: string;
};

export default function SportHero({
  title,
  subtitle,
  description,
  image,
  badge,
  bookingLink,
}: SportHeroProps) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${image})`,
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/65" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-[#050505]" />

      {/* Hero Content */}
      <div className="relative z-20 mx-auto flex w-full max-w-7xl flex-col items-center px-6 text-center text-white">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-full border border-[#B6F000] px-6 py-2 text-sm font-semibold uppercase tracking-[5px] text-[#B6F000]"
        >
          {badge}
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-6xl font-black uppercase md:text-8xl"
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-6 text-2xl font-semibold uppercase tracking-[8px] text-[#B6F000]"
        >
          {subtitle}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-8 max-w-3xl text-lg leading-9 text-gray-300"
        >
          {description}
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-12 flex flex-wrap justify-center gap-5"
        >
          <Link
            href={bookingLink}
            className="rounded-xl bg-[#B6F000] px-8 py-4 font-bold text-black transition duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(182,240,0,0.5)]"
          >
            Book Now
          </Link>

          <Link
            href="#gallery"
            className="rounded-xl border border-white px-8 py-4 font-semibold transition duration-300 hover:bg-white hover:text-black"
          >
            Explore Gallery
          </Link>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-24 grid w-full max-w-5xl grid-cols-2 gap-10 border-t border-white/10 pt-12 md:grid-cols-4"
        >
          <div>
            <h3 className="text-5xl font-black text-[#B6F000]">5000+</h3>
            <p className="mt-2 text-gray-300">Players</p>
          </div>

          <div>
            <h3 className="text-5xl font-black text-[#B6F000]">365</h3>
            <p className="mt-2 text-gray-300">Days Open</p>
          </div>

          <div>
            <h3 className="text-5xl font-black text-[#B6F000]">4.9★</h3>
            <p className="mt-2 text-gray-300">Rating</p>
          </div>

          <div>
            <h3 className="text-5xl font-black text-[#B6F000]">24×7</h3>
            <p className="mt-2 text-gray-300">Support</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}