"use client";

import { useEffect, useState } from "react";

import {
  BookingData,
  CreatedBooking,
} from "@/components/booking-widget/BookingWidget";

export type YogaTimeSlot = {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  durationLabel: string;
};

export const YOGA_TIME_SLOTS: YogaTimeSlot[] = [
  {
    id: "05:00-06:00",
    label: "5:00 AM – 6:00 AM",
    startTime: "05:00",
    endTime: "06:00",
    durationLabel: "1 Hour",
  },
  {
    id: "06:00-07:00",
    label: "6:00 AM – 7:00 AM",
    startTime: "06:00",
    endTime: "07:00",
    durationLabel: "1 Hour",
  },
  {
    id: "05:00-07:00",
    label: "5:00 AM – 7:00 AM",
    startTime: "05:00",
    endTime: "07:00",
    durationLabel: "2 Hours",
  },
];

type YogaSport = {
  id: string;
  name: string;
  slug: string;
  maxPlayers: number;
};

type YogaBookingFormProps = {
  onBookingCreated: (result: {
    booking: CreatedBooking;
    guestPaymentToken: string | null;
    bookingData: BookingData;
  }) => void;
  onBookingError: (message: string) => void;
  setBookingLoading: (loading: boolean) => void;
};

function getToday(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
}

export default function YogaBookingForm({
  onBookingCreated,
  onBookingError,
  setBookingLoading,
}: YogaBookingFormProps) {
  const [yogaSport, setYogaSport] =
    useState<YogaSport | null>(null);
  const [loadingSport, setLoadingSport] =
    useState(true);
  const [sportError, setSportError] =
    useState("");
  const [bookingDate, setBookingDate] =
    useState("");
  const [today, setToday] = useState("");
  const [selectedSlotId, setSelectedSlotId] =
    useState("");
  const [numberOfPlayers, setNumberOfPlayers] =
    useState(1);
  const [fullName, setFullName] =
    useState("");
  const [mobile, setMobile] = useState("");
  const [formError, setFormError] =
    useState("");

  useEffect(() => {
    setToday(getToday());

    async function loadYogaSport() {
      try {
        const response = await fetch(
          "/api/sports",
          {
            method: "GET",
            cache: "no-store",
          }
        );
        const result = await response.json();
        const sport = (result.sports ?? []).find(
          (item: YogaSport) =>
            item.slug === "yoga"
        );

        if (!response.ok || !result.success || !sport) {
          throw new Error(
            "Yoga booking is currently unavailable."
          );
        }

        setYogaSport(sport);
      } catch (error) {
        setSportError(
          error instanceof Error
            ? error.message
            : "Yoga booking is currently unavailable."
        );
      } finally {
        setLoadingSport(false);
      }
    }

    loadYogaSport();
  }, []);

  const selectedSlot = YOGA_TIME_SLOTS.find(
    (slot) => slot.id === selectedSlotId
  );

  const estimatedTotal = 399 * numberOfPlayers;

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setFormError("");
    onBookingError("");

    if (!yogaSport) {
      setFormError(
        "Yoga booking is currently unavailable."
      );
      return;
    }

    if (!bookingDate || (today && bookingDate < today)) {
      setFormError("Please select a valid booking date.");
      return;
    }

    if (!selectedSlot) {
      setFormError("Please select a Yoga session time.");
      return;
    }

    if (
      !Number.isInteger(numberOfPlayers) ||
      numberOfPlayers < 1 ||
      numberOfPlayers > yogaSport.maxPlayers
    ) {
      setFormError(
        `Choose between 1 and ${yogaSport.maxPlayers} participants.`
      );
      return;
    }

    const trimmedName = fullName.trim();
    const normalizedMobile = mobile.replace(/\D/g, "");

    if (
      trimmedName.length < 3 ||
      trimmedName.length > 100 ||
      !/^[A-Za-z ]+$/.test(trimmedName)
    ) {
      setFormError("Enter a valid full name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(normalizedMobile)) {
      setFormError("Enter a valid Indian mobile number.");
      return;
    }

    try {
      setBookingLoading(true);

      const response = await fetch(
        "/api/booking",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            sportId: yogaSport.id,
            bookingDate,
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime,
            numberOfPlayers,
            fullName: trimmedName,
            mobile: normalizedMobile,
          }),
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        !result.success ||
        !result.data?.booking?.id
      ) {
        throw new Error(
          result.message ??
            "Unable to create Yoga booking."
        );
      }

      const booking = result.data.booking;
      const createdBooking: CreatedBooking = {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        bookingDate: booking.bookingDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        duration: booking.duration,
        totalAmount: booking.totalAmount,
        status: booking.status,
      };

      onBookingCreated({
        booking: createdBooking,
        guestPaymentToken:
          typeof result.data.guestPaymentToken === "string"
            ? result.data.guestPaymentToken
            : null,
        bookingData: {
          sport: "Yoga",
          date: bookingDate,
          time: selectedSlot.label,
          duration: selectedSlot.durationLabel,
          players: numberOfPlayers,
          fullName: trimmedName,
          mobile: normalizedMobile,
          specialRequest: "",
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create Yoga booking.";
      setFormError(message);
      onBookingError(message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loadingSport) {
    return <p className="text-white/60">Loading Yoga sessions...</p>;
  }

  if (sportError) {
    return <p className="text-red-400">{sportError}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm text-white/70">
          Date
        </label>
        <input
          type="date"
          required
          min={today}
          value={bookingDate}
          onChange={(event) =>
            setBookingDate(event.target.value)
          }
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white color-scheme-dark"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-white/70">
          Session Time
        </label>
        <select
          required
          value={selectedSlotId}
          onChange={(event) =>
            setSelectedSlotId(event.target.value)
          }
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white"
        >
          <option value="" className="bg-[#11130F]">
            Select a session
          </option>
          {YOGA_TIME_SLOTS.map((slot) => (
            <option
              key={slot.id}
              value={slot.id}
              className="bg-[#11130F]"
            >
              {slot.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm text-white/70">
          Participants
        </label>
        <input
          type="number"
          required
          min={1}
          max={yogaSport?.maxPlayers ?? 25}
          value={numberOfPlayers}
          onChange={(event) =>
            setNumberOfPlayers(Number(event.target.value))
          }
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-white/70">
          Full Name
        </label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(event) =>
            setFullName(event.target.value)
          }
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-white/70">
          Mobile Number
        </label>
        <input
          type="tel"
          required
          maxLength={10}
          value={mobile}
          onChange={(event) =>
            setMobile(event.target.value)
          }
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white"
        />
      </div>

      <div className="rounded-xl border border-[#B6F000]/20 bg-[#B6F000]/[0.06] p-4 text-white">
        <p className="text-sm text-white/60">Price Estimate</p>
        <p className="mt-1 text-lg font-semibold text-[#B6F000]">
          ₹399 × {numberOfPlayers} participants
        </p>
        <p className="mt-1 text-xl font-bold">
          Estimated Total: ₹{estimatedTotal.toLocaleString("en-IN")}
        </p>
      </div>

      {formError && (
        <p className="text-sm text-red-400">{formError}</p>
      )}

      <button
        type="submit"
        className="w-full rounded-xl bg-[#B6F000] px-5 py-3 font-bold text-black transition hover:brightness-110"
      >
        Continue to Payment
      </button>
    </form>
  );
}
