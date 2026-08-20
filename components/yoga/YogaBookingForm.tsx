"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  BookingData,
  CreatedBooking,
} from "@/components/booking-widget/BookingWidget";
import { validateEmail } from "@/components/booking-widget/validators";

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
  const prefersReducedMotion = useReducedMotion();
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
  const [email, setEmail] = useState("");
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
    const trimmedEmail = email.trim();
    const normalizedMobile = mobile.replace(/\D/g, "");

    if (
      !trimmedName ||
      trimmedName.length > 100 ||
      !/^[A-Za-z]/.test(trimmedName)
    ) {
      setFormError("Please enter a valid full name.");
      return;
    }

    const emailError = validateEmail(trimmedEmail);

    if (emailError) {
      setFormError(emailError);
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
            email: trimmedEmail,
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
          email: trimmedEmail,
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
    <motion.form
      onSubmit={handleSubmit}
      initial={
        prefersReducedMotion
          ? false
          : { opacity: 0, y: 10 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
      className="space-y-6"
    >
      <div>
        <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-white/65">
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
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition focus:border-amber-200/60 focus:ring-2 focus:ring-amber-100/10 color-scheme-dark"
        />
      </div>

      <div>
        <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.16em] text-white/65">
          Session Time
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          {YOGA_TIME_SLOTS.map((slot) => (
            <motion.button
              type="button"
              key={slot.id}
              onClick={() => setSelectedSlotId(slot.id)}
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : { y: -2 }
              }
              className={`rounded-2xl border p-4 text-left transition duration-200 ${
                selectedSlotId === slot.id
                  ? "border-amber-200/70 bg-amber-100/[0.1] shadow-[0_10px_30px_rgba(242,184,92,0.1)]"
                  : "border-white/10 bg-white/[0.03] hover:border-amber-100/30"
              }`}
            >
              <span className="block text-sm uppercase tracking-[0.14em] text-amber-200/75">Morning session</span>
              <span className="mt-2 block text-base font-semibold text-white">{slot.label}</span>
              <span className="mt-3 block text-sm text-white/55">₹399 / person / day</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-white/65">
          Email ID
        </label>
        <input
          type="email"
          required
          maxLength={255}
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition focus:border-amber-200/60 focus:ring-2 focus:ring-amber-100/10"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-white/65">
          Participants
        </label>
        <input
          type="number"
          required
          min={1}
          max={yogaSport?.maxPlayers ?? 30}
          value={numberOfPlayers}
          onChange={(event) =>
            setNumberOfPlayers(Number(event.target.value))
          }
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition focus:border-amber-200/60 focus:ring-2 focus:ring-amber-100/10"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-white/65">
          Full Name
        </label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(event) =>
            setFullName(event.target.value)
          }
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition focus:border-amber-200/60 focus:ring-2 focus:ring-amber-100/10"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-white/65">
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
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition focus:border-amber-200/60 focus:ring-2 focus:ring-amber-100/10"
        />
      </div>

      <div className="rounded-2xl border border-amber-200/20 bg-gradient-to-br from-amber-100/[0.09] to-[#B6F000]/[0.04] p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/70">Estimated price</p>
        <p className="mt-2 text-lg font-semibold text-[#B6F000]">
          ₹399 × {numberOfPlayers} participants
        </p>
        <p className="mt-2 text-3xl font-bold tracking-tight">
          Estimated Total: ₹{estimatedTotal.toLocaleString("en-IN")}
        </p>
      </div>

      {formError && (
        <p className="text-sm text-red-400">{formError}</p>
      )}

      <button
        type="submit"
        className="min-h-12 w-full rounded-2xl bg-amber-200 px-5 py-3 font-bold text-[#21170e] shadow-[0_10px_30px_rgba(242,184,92,0.15)] transition duration-200 hover:-translate-y-0.5 hover:bg-amber-100 hover:shadow-[0_14px_36px_rgba(242,184,92,0.22)] active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-[#11100d]"
      >
        Continue to Payment
      </button>
    </motion.form>
  );
}
