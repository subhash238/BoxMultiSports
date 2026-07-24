"use client";

import { BookingData } from "./BookingWidget";
import { sports } from "@/data/sports";

interface BookingSummaryProps {
  bookingData: BookingData;
}

export default function BookingSummary({
  bookingData,
}: BookingSummaryProps) {

  const selectedSport = sports.find(
    (sport) => sport.id === bookingData.sport
  );

  const durationHours =
    parseInt(bookingData.duration) || 1;

  const totalPrice = selectedSport
    ? selectedSport.pricePerHour * durationHours
    : 0;

  return (
    <div className="rounded-3xl border border-[#B6F000]/20 bg-black/40 p-6 backdrop-blur-xl">

      <h3 className="text-2xl font-bold text-[#B6F000]">
        Booking Summary
      </h3>

      <p className="mt-2 text-sm text-gray-400">
        Review your booking details.
      </p>

      <div className="my-6 h-px bg-white/10" />

      <div className="space-y-5">

        <SummaryRow
          label="Sport"
          value={
            selectedSport
              ? `${selectedSport.icon} ${selectedSport.name}`
              : "-"
          }
        />

        <SummaryRow
          label="Date"
          value={bookingData.date || "-"}
        />

        <SummaryRow
          label="Time"
          value={bookingData.time || "-"}
        />

        <SummaryRow
          label="Duration"
          value={bookingData.duration}
        />

        <SummaryRow
          label="Players"
          value={`${bookingData.players}`}
        />

      </div>

      <div className="my-6 h-px bg-white/10" />

      <div className="flex items-center justify-between">

        <span className="text-lg text-gray-300">
          Estimated Price
        </span>

        <span className="text-3xl font-black text-[#B6F000]">
          ₹{totalPrice}
        </span>

      </div>

      <div className="mt-8 rounded-2xl bg-[#B6F000]/10 p-5">

        <ul className="space-y-3 text-sm text-gray-300">

          <li>✅ Instant Booking Confirmation</li>

          <li>✅ Secure Online Payment</li>

          <li>✅ Premium Turf Experience</li>

          <li>✅ Customer Support Available</li>

        </ul>

      </div>

    </div>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({
  label,
  value,
}: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between">

      <span className="text-gray-400">
        {label}
      </span>

      <span className="font-semibold text-white">
        {value}
      </span>

    </div>
  );
}