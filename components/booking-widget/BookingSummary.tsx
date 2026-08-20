"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Check,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { BookingData } from "./BookingWidget";

interface Sport {
  id: string;
  name: string;
  slug: string;
  pricing?: {
    duration: number;
    price: number | string;
  }[];
  maxPlayers?: number | null;
}

interface BookingSummaryProps {
  bookingData: BookingData;
}

// ==========================================
// Format Date
// ==========================================

function formatBookingDate(date: string): string {
  if (!date) {
    return "Select a date";
  }

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return "Select a date";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ==========================================
// Parse Duration
// ==========================================

function getDurationHours(duration: string): number {
  const hours = Number.parseInt(duration, 10);

  return Number.isFinite(hours) ? hours : 0;
}

// ==========================================
// Currency Formatter
// ==========================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ==========================================
// Component
// ==========================================

export default function BookingSummary({
  bookingData,
}: BookingSummaryProps) {
  const [sports, setSports] = useState<Sport[]>([]);

  // ==========================================
  // Fetch Sports
  // ==========================================

  useEffect(() => {
    let mounted = true;

    async function fetchSports() {
      try {
        const response = await fetch("/api/sports", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          return;
        }

        if (mounted) {
          setSports(result.sports ?? []);
        }
      } catch {
        // Keep the summary usable when sport metadata is unavailable.
      }
    }

    fetchSports();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================
  // Selected Sport
  // ==========================================

  const selectedSport = useMemo(() => {
    return sports.find(
      (sport) => sport.id === bookingData.sport
    );
  }, [sports, bookingData.sport]);

  // ==========================================
  // Price Calculation
  // ==========================================

  const durationHours = getDurationHours(
    bookingData.duration
  );

  const selectedPricing =
    selectedSport?.pricing?.find(
      (pricing) =>
        pricing.duration === durationHours
    );

  const estimatedPrice =
    selectedSport?.slug === "yoga" ||
    selectedSport?.slug === "gym"
      ? 399 * bookingData.players!
      : Number(selectedPricing?.price ?? 0);

  // ==========================================
  // Selected State
  // ==========================================

  const hasSport = Boolean(bookingData.sport);
  const hasDate = Boolean(bookingData.date);
  const hasTime = Boolean(bookingData.time);
  const hasDuration = Boolean(bookingData.duration);

  // ==========================================
  // UI
  // ==========================================

  return (
    <aside className="w-full lg:sticky lg:top-28">
      <div
        className="
          relative
          overflow-hidden
          rounded-[26px]
          border border-white/[0.09]
          bg-gradient-to-b
          from-[#111510]
          via-[#0b0d0b]
          to-[#080908]
          shadow-[0_25px_80px_rgba(0,0,0,0.45)]
        "
      >
        {/* ====================================
            Subtle Lime Glow
        ==================================== */}

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-56
            w-56
            rounded-full
            bg-[#B6F000]/[0.07]
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-32
            -left-24
            h-64
            w-64
            rounded-full
            bg-[#B6F000]/[0.04]
            blur-3xl
          "
        />

        {/* ====================================
            Header
        ==================================== */}

        <div
          className="
            relative
            border-b
            border-white/[0.08]
            px-6
            py-6
            sm:px-7
          "
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                className="
                  mb-2
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.22em]
                  text-[#B6F000]
                "
              >
                UniTurf
              </p>

              <h2
                className="
                  text-[22px]
                  font-bold
                  tracking-[-0.03em]
                  text-white
                "
              >
                Booking Summary
              </h2>

              <p className="mt-1.5 text-xs text-white/40">
                Review your game details.
              </p>
            </div>

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-[#B6F000]/20
                bg-[#B6F000]/10
              "
            >
              <Sparkles
                size={18}
                strokeWidth={2}
                className="text-[#B6F000]"
              />
            </div>
          </div>
        </div>

        {/* ====================================
            Booking Details
        ==================================== */}

        <div className="relative px-5 py-5 sm:px-6">
          <div className="space-y-1">
            {/* Sport */}

            <SummaryRow
              icon={<MapPin size={16} />}
              label="Sport"
              value={
                selectedSport?.name ??
                (hasSport
                  ? "Loading..."
                  : "Select sport")
              }
              active={hasSport}
            />

            {/* Date */}

            <SummaryRow
              icon={<CalendarDays size={16} />}
              label="Date"
              value={formatBookingDate(
                bookingData.date
              )}
              active={hasDate}
            />

            {/* Time */}

            <SummaryRow
              icon={<Clock3 size={16} />}
              label="Time"
              value={
                bookingData.time || "Select time"
              }
              active={hasTime}
            />

            {/* Duration */}

            <SummaryRow
              icon={<Clock3 size={16} />}
              label="Duration"
              value={
                bookingData.duration || "1 Hour"
              }
              active={hasDuration}
            />

          </div>

          {/* ==================================
              Divider
          ================================== */}

          <div className="my-5 h-px bg-white/[0.08]" />

          {/* ==================================
              Price
          ================================== */}

          <div
            className="
              rounded-[20px]
              border
              border-white/[0.07]
              bg-white/[0.035]
              p-5
            "
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-white/45">
                  Estimated Price
                </p>

                <p className="mt-1 text-[10px] leading-4 text-white/25">
                  Based on selected sport & duration
                </p>
              </div>

              <div className="text-right">
                <p
                  className="
                    text-[28px]
                    font-bold
                    tracking-[-0.04em]
                    text-[#B6F000]
                  "
                >
                  {formatCurrency(estimatedPrice)}
                </p>

              </div>
            </div>
          </div>

          {/* ==================================
              Benefits
          ================================== */}

          <div
            className="
              mt-4
              rounded-[20px]
              border
              border-[#B6F000]/15
              bg-gradient-to-br
              from-[#B6F000]/[0.09]
              to-[#B6F000]/[0.025]
              p-5
            "
          >
            <div className="mb-4 flex items-center gap-2">
              <div
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#B6F000]/15
                "
              >
                <Sparkles
                  size={14}
                  className="text-[#B6F000]"
                />
              </div>

              <p className="text-sm font-semibold text-white">
                Why book with UniTurf?
              </p>
            </div>

            <div className="space-y-3">
              <Benefit>
                Instant booking confirmation
              </Benefit>

              <Benefit>
                Secure online payment
              </Benefit>

              <Benefit>
                Premium turf experience
              </Benefit>

              <Benefit>
                Customer support available
              </Benefit>
            </div>
          </div>

          {/* ==================================
              Payment Notice
          ================================== */}

          <div
            className="
              mt-4
              flex
              gap-3
              rounded-[18px]
              border
              border-white/[0.07]
              bg-white/[0.025]
              p-4
            "
          >
            <div
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#B6F000]/10
              "
            >
              <ShieldCheck
                size={16}
                className="text-[#B6F000]"
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-white/75">
                Secure payment
              </p>

              <p className="mt-1 text-[10px] leading-4 text-white/30">
                Your slot is temporarily held while
                payment is completed. Booking is
                confirmed only after successful payment.
              </p>
            </div>
          </div>
        </div>

        {/* ====================================
            Bottom Accent
        ==================================== */}

        <div
          className="
            h-px
            w-full
            bg-gradient-to-r
            from-transparent
            via-[#B6F000]/40
            to-transparent
          "
        />
      </div>
    </aside>
  );
}

// ==========================================
// Summary Row
// ==========================================

function SummaryRow({
  icon,
  label,
  value,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div
      className="
        group
        flex
        items-center
        justify-between
        gap-4
        rounded-2xl
        px-2
        py-3
        transition-all
        duration-200
        hover:bg-white/[0.025]
      "
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-white/[0.06]
            bg-white/[0.035]
            text-white/40
            transition-colors
            group-hover:border-[#B6F000]/20
            group-hover:text-[#B6F000]
          "
        >
          {icon}
        </div>

        <span className="text-xs text-white/40">
          {label}
        </span>
      </div>

      <span
        className={`
          max-w-[55%]
          truncate
          text-right
          text-xs
          font-semibold
          ${
            active
              ? "text-white/85"
              : "text-white/20"
          }
        `}
      >
        {value}
      </span>
    </div>
  );
}

// ==========================================
// Benefit Component
// ==========================================

function Benefit({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="
          flex
          h-5
          w-5
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-[#B6F000]
          shadow-[0_0_12px_rgba(182,240,0,0.15)]
        "
      >
        <Check
          size={11}
          strokeWidth={3}
          className="text-[#182000]"
        />
      </span>

      <span className="text-[11px] font-medium text-white/50">
        {children}
      </span>
    </div>
  );
}
