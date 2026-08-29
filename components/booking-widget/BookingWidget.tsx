"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import BookingForm from "./BookingForm";
import BookingSummary from "./BookingSummary";
import PaymentModal from "./PaymentModal";

export interface BookingData {
  sport: string;
  date: string;
  time: string;
  duration: string;
  durationMinutes?: number;
  players?: number;
  fullName: string;
  email: string;
  mobile: string;
  specialRequest: string;
}

export interface CreatedBooking {
  id: string;
  bookingNumber: string;
  sportName?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: number | string;
  status: string;
}

interface BookingWidgetProps {
  selectedSportSlug?: string | null;
  variant?: "section" | "modal";
}

export default function BookingWidget({
  selectedSportSlug = null,
  variant = "section",
}: BookingWidgetProps) {
  const isModal = variant === "modal";
  const [bookingData, setBookingData] =
    useState<BookingData>({
      sport: "",
      date: "",
      time: "",
      duration: "1 Hour",
      durationMinutes: 60,
      fullName: "",
      email: "",
      mobile: "",
      specialRequest: "",
    });

  const [createdBooking, setCreatedBooking] =
    useState<CreatedBooking | null>(null);

  const [
    guestPaymentToken,
    setGuestPaymentToken,
  ] = useState<string | null>(null);

  const [paymentOpen, setPaymentOpen] =
    useState(false);

  const [bookingLoading, setBookingLoading] =
    useState(false);

  const [bookingError, setBookingError] =
    useState<string | null>(null);

  const [paymentSuccess, setPaymentSuccess] =
    useState(false);

  useEffect(() => {
    if (
      isModal ||
      typeof window === "undefined" ||
      window.location.hash !== "#booking"
    ) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const bookingSection =
        document.getElementById("booking");

      if (!bookingSection) {
        return;
      }

      bookingSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isModal]);

  // ==========================================
  // Booking Created
  // ==========================================

  const handleBookingCreated = (
    result: {
      booking: CreatedBooking;
      guestPaymentToken: string | null;
    }
  ) => {
    setCreatedBooking(result.booking);
    setGuestPaymentToken(
      result.guestPaymentToken
    );
    setBookingError(null);
    setPaymentSuccess(false);
    setPaymentOpen(true);
  };

  // ==========================================
  // Booking Error
  // ==========================================

  const handleBookingError = (
    message: string
  ) => {
    setBookingError(message);
  };

  // ==========================================
  // Payment Success
  // ==========================================

  const handlePaymentSuccess = () => {
    setGuestPaymentToken(null);
    setPaymentOpen(false);
    setPaymentSuccess(true);
  };

  return (
    <section
      id={isModal ? undefined : "booking"}
      className={`
        relative
        isolate
        overflow-hidden
        bg-[#050705]
        ${isModal
          ? "mx-auto w-full max-w-[1240px] rounded-[28px]"
          : "scroll-mt-32 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28"}
      `}
    >
      {/* ==================================================
          PREMIUM BACKGROUND
      ================================================== */}

      {/* Main central glow */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[180px]
          h-[620px]
          w-[900px]
          -translate-x-1/2
          rounded-full
          bg-[#B6F000]/[0.045]
          blur-[150px]
        "
      />

      {/* Top subtle glow */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          h-[260px]
          w-[700px]
          -translate-x-1/2
          rounded-full
          bg-[#B6F000]/[0.025]
          blur-[120px]
        "
      />

      {/* Left atmosphere */}
      <div
        className="
          pointer-events-none
          absolute
          -left-[180px]
          top-[42%]
          h-[420px]
          w-[420px]
          rounded-full
          bg-[#B6F000]/[0.018]
          blur-[130px]
        "
      />

      {/* Right atmosphere */}
      <div
        className="
          pointer-events-none
          absolute
          -right-[180px]
          bottom-[5%]
          h-[420px]
          w-[420px]
          rounded-full
          bg-[#B6F000]/[0.018]
          blur-[130px]
        "
      />

      {/* Very subtle grid texture */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.025]
          [background-image:linear-gradient(rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.25)_1px,transparent_1px)]
          [background-size:70px_70px]
        "
      />

      {/* ==================================================
          MAIN CONTAINER
      ================================================== */}

      <div
        className="
          relative
          mx-auto
          w-full
          max-w-[1240px]
        "
      >

        {/* ==================================================
            HEADING
        ================================================== */}

        {!isModal && <motion.div
          initial={{
            opacity: 0,
            y: 24,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.65,
            ease: "easeOut",
          }}
          viewport={{
            once: true,
          }}
          className="
            mx-auto
            mb-10
            max-w-3xl
            text-center
            sm:mb-12
          "
        >
          {/* Small label */}

          <div
            className="
              mb-5
              flex
              items-center
              justify-center
              gap-2
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-[#B6F000]
                shadow-[0_0_14px_rgba(182,240,0,0.85)]
              "
            />

            <span
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.3em]
                text-[#B6F000]
              "
            >
              UniTurf Booking
            </span>

            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-[#B6F000]
                shadow-[0_0_14px_rgba(182,240,0,0.85)]
              "
            />
          </div>

          <h2
            className="
              text-3xl
              font-semibold
              tracking-[-0.045em]
              text-white
              sm:text-4xl
              md:text-5xl
            "
          >
            Reserve Your Turf.
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-sm
              leading-6
              text-white/45
              sm:text-base
            "
          >
            Choose your sport, select your preferred
            time and reserve your game in less than
            one minute.
          </p>
        </motion.div>}

        {/* ==================================================
            MAIN BOOKING SURFACE
        ================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 28,
            scale: 0.985,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          viewport={{
            once: true,
          }}
          className="
            relative
            overflow-hidden
            rounded-[28px]
            border
            border-white/[0.10]
            bg-gradient-to-br
            from-[#111611]
            via-[#090b09]
            to-[#060706]
            p-[1px]
            shadow-[0_40px_120px_rgba(0,0,0,0.65)]
          "
        >

          {/* ==================================================
              INNER SURFACE
          ================================================== */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[27px]
              bg-gradient-to-br
              from-[#101310]
              via-[#090b09]
              to-[#070807]
              p-3
              sm:p-4
              lg:p-5
            "
          >

            {/* ==================================================
                DECORATIVE TOP GLOW
            ================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-0
                h-[220px]
                w-[620px]
                -translate-x-1/2
                rounded-full
                bg-[#B6F000]/[0.035]
                blur-[100px]
              "
            />

            {/* ==================================================
                DECORATIVE CORNER GLOW
            ================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                -right-32
                -top-32
                h-[380px]
                w-[380px]
                rounded-full
                bg-[#B6F000]/[0.025]
                blur-[110px]
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-40
                -left-40
                h-[400px]
                w-[400px]
                rounded-full
                bg-[#B6F000]/[0.018]
                blur-[120px]
              "
            />

            {/* ==================================================
                BOOKING LAYOUT / SUCCESS
            ================================================== */}

            {paymentSuccess && createdBooking ? (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 14,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="
                  relative
                  mx-auto
                  w-full
                  max-w-2xl
                  rounded-[22px]
                  border
                  border-[#B6F000]/20
                  bg-[#090b09]/90
                  px-5
                  py-8
                  text-center
                  shadow-[0_20px_60px_rgba(0,0,0,0.30)]
                  sm:px-8
                  sm:py-10
                "
              >
                <div
                  className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-[#B6F000]/10
                  "
                >
                  <CheckCircle2
                    size={30}
                    className="text-[#B6F000]"
                  />
                </div>

                <p
                  className="
                    mt-5
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.28em]
                    text-[#B6F000]
                  "
                >
                  Payment Successful
                </p>

                <h3
                  className="
                    mt-2
                    text-2xl
                    font-semibold
                    tracking-[-0.03em]
                    text-white
                    sm:text-3xl
                  "
                >
                  Booking Confirmed
                </h3>

                <p
                  className="
                    mx-auto
                    mt-3
                    max-w-lg
                    text-sm
                    leading-6
                    text-white/50
                  "
                >
                  Your payment was successful and your turf booking is confirmed.
                  Save your booking number for reference.
                </p>

                <div
                  className="
                    mt-7
                    rounded-2xl
                    border
                    border-white/[0.09]
                    bg-white/[0.035]
                    p-5
                    text-left
                  "
                >
                  <div
                    className="
                      border-b
                      border-white/[0.07]
                      pb-4
                      text-center
                    "
                  >
                    <p
                      className="
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.2em]
                        text-white/40
                      "
                    >
                      Booking Number
                    </p>

                    <p
                      className="
                        mt-2
                        text-xl
                        font-bold
                        text-[#B6F000]
                      "
                    >
                      {createdBooking.bookingNumber}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-white/40">
                        Sport
                      </span>
                      <span className="text-right font-semibold text-white">
                        {createdBooking.sportName ??
                          bookingData.sport}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-white/40">
                        Date
                      </span>
                      <span className="text-right font-semibold text-white">
                        {bookingData.date}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-white/40">
                        Time
                      </span>
                      <span className="text-right font-semibold text-white">
                        {bookingData.time}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-white/40">
                        Duration
                      </span>
                      <span className="text-right font-semibold text-white">
                        {bookingData.duration}
                      </span>
                    </div>

                    <div
                      className="
                        flex
                        justify-between
                        gap-4
                        border-t
                        border-white/[0.07]
                        pt-3
                      "
                    >
                      <span className="font-semibold text-white">
                        Total Amount
                      </span>
                      <span className="text-right text-lg font-bold text-[#B6F000]">
                        ₹{Number(
                          createdBooking.totalAmount
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div
                className="
                  relative
                  grid
                  w-full
                  grid-cols-1
                  items-start
                  gap-4
                  lg:grid-cols-[minmax(0,1fr)_330px]
                  lg:gap-5
                  xl:grid-cols-[minmax(0,1fr)_350px]
                "
              >

                {/* ==================================================
                    FORM PANEL
                ================================================== */}

                <div
                  className="
                    min-w-0
                    overflow-hidden
                    rounded-[22px]
                    border
                    border-white/[0.09]
                    bg-[#090b09]/90
                    shadow-[0_20px_60px_rgba(0,0,0,0.25)]
                  "
                >
                  <BookingForm
                    compact={isModal}
                    bookingData={bookingData}
                    setBookingData={setBookingData}
                    selectedSportSlug={selectedSportSlug}
                    onBookingCreated={
                      handleBookingCreated
                    }
                    onBookingError={
                      handleBookingError
                    }
                    setBookingLoading={
                      setBookingLoading
                    }
                  />
                </div>

                {/* ==================================================
                    SUMMARY PANEL
                ================================================== */}

                <div
                  className="
                    min-w-0
                    lg:sticky
                    lg:top-6
                  "
                >
                  <div
                    className="
                      overflow-hidden
                      rounded-[22px]
                      border
                      border-white/[0.09]
                      bg-gradient-to-b
                      from-[#101410]
                      via-[#0b0e0b]
                      to-[#080a08]
                      shadow-[0_20px_60px_rgba(0,0,0,0.30)]
                    "
                  >
                    <BookingSummary
                      bookingData={bookingData}
                    />
                  </div>
                </div>

              </div>
            )}

            {/* ==================================================
                TRUST BAR
            ================================================== */}

            <div
              className="
                relative
                mt-4
                flex
                flex-wrap
                items-center
                justify-center
                gap-x-6
                gap-y-3
                border-t
                border-white/[0.07]
                px-3
                pt-4
                sm:gap-x-8
              "
            >

              {/* Secure payment */}

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  text-white/35
                "
              >
                <span
                  className="
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-[#B6F000]/[0.08]
                  "
                >
                  <ShieldCheck
                    size={11}
                    className="text-[#B6F000]"
                  />
                </span>

                <span>
                  Secure online payment
                </span>
              </div>

              <span
                className="
                  hidden
                  text-white/15
                  sm:block
                "
              >
                •
              </span>

              {/* Instant confirmation */}

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  text-white/35
                "
              >
                <CheckCircle2
                  size={13}
                  className="text-[#B6F000]/70"
                />

                <span>
                  Instant booking confirmation
                </span>
              </div>

              <span
                className="
                  hidden
                  text-white/15
                  sm:block
                "
              >
                •
              </span>

              {/* Premium experience */}

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  text-white/35
                "
              >
                <Sparkles
                  size={13}
                  className="text-[#B6F000]/70"
                />

                <span>
                  Premium turf experience
                </span>
              </div>

            </div>

          </div>
        </motion.div>

        {/* ==================================================
            BOOKING ERROR
        ================================================== */}

        {bookingError && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              mx-auto
              mt-5
              max-w-3xl
              rounded-2xl
              border
              border-red-500/20
              bg-red-500/[0.08]
              px-5
              py-4
              text-center
              text-sm
              text-red-400
              shadow-[0_10px_40px_rgba(239,68,68,0.08)]
            "
          >
            {bookingError}
          </motion.div>
        )}

        {/* ==================================================
            PAYMENT MODAL
        ================================================== */}

        {paymentOpen &&
          createdBooking && (
            <PaymentModal
              booking={createdBooking}
              bookingData={bookingData}
              guestPaymentToken={
                guestPaymentToken
              }
              loading={bookingLoading}
              onClose={() => {
                setPaymentOpen(false);
              }}
              onSuccess={
                handlePaymentSuccess
              }
            />
          )}

      </div>
    </section>
  );
}
