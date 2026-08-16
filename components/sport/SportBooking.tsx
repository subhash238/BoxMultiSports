"use client";

import { motion } from "framer-motion";

interface SportBookingProps {
  sportName?: string;
  sportId?: string;
}

export default function SportBooking({
  sportName = "Your Sport",
}: SportBookingProps) {
  return (
    <section
      id="sport-booking"
      className="relative py-20 px-6 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl md:p-12"
        >
          <span className="inline-block rounded-full border border-[#B6F000]/30 bg-[#B6F000]/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#B6F000]">
            Book Your Slot
          </span>

          <h2 className="mt-5 text-3xl font-black text-white md:text-4xl">
            Ready to Play {sportName}?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Choose your preferred date and time and reserve your
            playing slot online.
          </p>

          <a
            href="/booking"
            className="mt-8 inline-flex h-14 items-center justify-center rounded-2xl bg-[#B6F000] px-8 text-lg font-bold text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(182,240,0,0.45)]"
          >
            Book Now →
          </a>
        </motion.div>
      </div>
    </section>
  );
}