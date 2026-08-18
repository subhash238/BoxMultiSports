"use client";

import { useState } from "react";
import {
  motion,
  useReducedMotion,
} from "framer-motion";

import PaymentModal from "@/components/booking-widget/PaymentModal";
import {
  BookingData,
  CreatedBooking,
} from "@/components/booking-widget/BookingWidget";

import YogaBookingForm from "./YogaBookingForm";

export default function YogaBookingWidget() {
  const prefersReducedMotion = useReducedMotion();
  const [createdBooking, setCreatedBooking] =
    useState<CreatedBooking | null>(null);
  const [bookingData, setBookingData] =
    useState<BookingData | null>(null);
  const [guestPaymentToken, setGuestPaymentToken] =
    useState<string | null>(null);
  const [paymentOpen, setPaymentOpen] =
    useState(false);
  const [bookingLoading, setBookingLoading] =
    useState(false);
  const [bookingError, setBookingError] =
    useState("");
  const [paymentSuccess, setPaymentSuccess] =
    useState(false);

  const handleBookingCreated = (result: {
    booking: CreatedBooking;
    guestPaymentToken: string | null;
    bookingData: BookingData;
  }) => {
    setCreatedBooking(result.booking);
    setBookingData(result.bookingData);
    setGuestPaymentToken(result.guestPaymentToken);
    setBookingError("");
    setPaymentSuccess(false);
    setPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    setGuestPaymentToken(null);
    setPaymentOpen(false);
    setPaymentSuccess(true);
  };

  return (
    <motion.section
      initial={
        prefersReducedMotion
          ? false
          : { opacity: 0, y: 18 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.45 }}
      className="rounded-3xl border border-white/10 bg-[#11100d]/70 p-6 text-white shadow-[0_20px_80px_rgba(0,0,0,0.25)] md:p-10"
    >
      <div className="mx-auto max-w-2xl">
        {paymentSuccess ? (
          <motion.div
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0, y: 10 }
            }
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[#B6F000]/20 bg-[#B6F000]/[0.06] p-6 text-center"
          >
            <h2 className="text-2xl font-bold text-[#B6F000]">
              Yoga Booking Confirmed
            </h2>
            <p className="mt-2 text-white/70">
              Your payment was successful and your Yoga session is confirmed.
            </p>
            {createdBooking && (
              <p className="mt-4 font-semibold">
                Booking Number: {createdBooking.bookingNumber}
              </p>
            )}
          </motion.div>
        ) : (
          <YogaBookingForm
            onBookingCreated={handleBookingCreated}
            onBookingError={setBookingError}
            setBookingLoading={setBookingLoading}
          />
        )}

        {bookingError && !paymentOpen && !paymentSuccess && (
          <p className="mt-4 text-sm text-red-400">{bookingError}</p>
        )}

        {paymentOpen && createdBooking && bookingData && (
          <PaymentModal
            booking={createdBooking}
            bookingData={bookingData}
            guestPaymentToken={guestPaymentToken}
            loading={bookingLoading}
            onClose={() => setPaymentOpen(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </motion.section>
  );
}
