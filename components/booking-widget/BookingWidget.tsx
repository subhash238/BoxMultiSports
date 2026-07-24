"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import BookingForm from "./BookingForm";
import BookingSummary from "./BookingSummary";
import { validateBooking } from "./validators";

export interface BookingData {
  sport: string;
  date: string;
  time: string;
  duration: string;
  players: number;
  fullName: string;
  mobile: string;
  specialRequest: string;
}

export default function BookingWidget() {
  const [bookingData, setBookingData] = useState<BookingData>({
    sport: "",
    date: "",
    time: "",
    duration: "1 Hour",
    players: 2,
    fullName: "",
    mobile: "",
    specialRequest: "",
  });

  return (
    <section
      id="booking"
      className="relative py-24 px-6 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-[#B6F000]/40 bg-[#B6F000]/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#B6F000]">
            Online Booking
          </span>

          <h2 className="mt-5 text-4xl font-black text-white md:text-5xl">
            Reserve Your Turf
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-400">
            Choose your sport, select a slot and reserve your game in less than
            one minute.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl lg:grid-cols-[2fr_1fr]"
        >
          <BookingForm
            bookingData={bookingData}
            setBookingData={setBookingData}
          />

          <BookingSummary bookingData={bookingData} />
        </motion.div>
      </div>
    </section>
  );
}