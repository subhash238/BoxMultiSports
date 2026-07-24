"use client";

import { BookingData } from "./BookingWidget";
import { sports } from "@/data/sports";
import BookingField from "./BookingField";

interface BookingFormProps {
  bookingData: BookingData;
  setBookingData: React.Dispatch<React.SetStateAction<BookingData>>;
}

export default function BookingForm({
  bookingData,
  setBookingData,
}: BookingFormProps) {
  const updateField = (field: keyof BookingData, value: any) => {
    setBookingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-8">

      {/* Sport & Date */}

      <div className="grid gap-6 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Sport
          </label>

          <select
            value={bookingData.sport}
            onChange={(e) => updateField("sport", e.target.value)}
            className="h-14 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-white outline-none transition focus:border-[#B6F000]"
          >
            <option value="">Select Sport</option>

            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.icon} {sport.name}
              </option>
            ))}
          </select>
        </div>

        <BookingField
          label="Booking Date"
          type="date"
          value={bookingData.date}
          onChange={(e) => updateField("date", e.target.value)}
        />
      </div>

      {/* Time & Duration */}

      <div className="grid gap-6 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Time Slot
          </label>

          <select
            value={bookingData.time}
            onChange={(e) => updateField("time", e.target.value)}
            className="h-14 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-white outline-none transition focus:border-[#B6F000]"
          >
            <option value="">Select Time</option>

            <option>06:00 AM</option>
            <option>07:00 AM</option>
            <option>08:00 AM</option>
            <option>09:00 AM</option>
            <option>10:00 AM</option>
            <option>11:00 AM</option>
            <option>12:00 PM</option>
            <option>01:00 PM</option>
            <option>02:00 PM</option>
            <option>03:00 PM</option>
            <option>04:00 PM</option>
            <option>05:00 PM</option>
            <option>06:00 PM</option>
            <option>07:00 PM</option>
            <option>08:00 PM</option>
            <option>09:00 PM</option>
            <option>10:00 PM</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Duration
          </label>

          <select
            value={bookingData.duration}
            onChange={(e) => updateField("duration", e.target.value)}
            className="h-14 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-white outline-none transition focus:border-[#B6F000]"
          >
            <option>1 Hour</option>
            <option>2 Hours</option>
            <option>3 Hours</option>
          </select>
        </div>

      </div>      {/* Players & Mobile */}

      <div className="grid gap-6 md:grid-cols-2">

        <BookingField
          label="Number of Players"
          type="number"
          value={bookingData.players}
          onChange={(e) =>
            updateField("players", Number(e.target.value))
          }
        />

        <BookingField
          label="Mobile Number"
          type="tel"
          placeholder="Enter mobile number"
          value={bookingData.mobile}
          onChange={(e) =>
            updateField("mobile", e.target.value)
          }
        />

      </div>

      {/* Full Name */}

      <BookingField
        label="Full Name"
        placeholder="Enter your full name"
        value={bookingData.fullName}
        onChange={(e) =>
          updateField("fullName", e.target.value)
        }
      />

      {/* Special Request */}

      <BookingField
        label="Special Request"
        textarea
        placeholder="Birthday match, Corporate event, Tournament, Coaching..."
        value={bookingData.specialRequest}
        onChange={(e) =>
          updateField("specialRequest", e.target.value)
        }
      />

      {/* Continue Button */}

      <button
        type="button"
        className="
          h-14
          w-full
          rounded-2xl
          bg-[#B6F000]
          text-lg
          font-bold
          text-black
          transition-all
          duration-300
          hover:scale-[1.02]
          hover:shadow-[0_0_30px_rgba(182,240,0,0.45)]
          active:scale-95
        "
      >
        Continue Booking →
      </button>

    </div>
  );
}