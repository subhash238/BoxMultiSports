"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  BookingData,
  CreatedBooking,
} from "@/components/booking-widget/BookingWidget";
import { validateEmail } from "@/components/booking-widget/validators";

type YogaDurationOption = {
  label: string;
  minutes: number;
};

const YOGA_DURATION_OPTIONS: YogaDurationOption[] = [
  { label: "1 Hour", minutes: 60 },
  { label: "1.5 Hours", minutes: 90 },
  { label: "2 Hours", minutes: 120 },
];

const YOGA_OPENING_MINUTES = 5 * 60;
const YOGA_CLOSING_MINUTES = 7 * 60;
const YOGA_START_INTERVAL_MINUTES = 30;

type YogaTimeOption = {
  label: string;
  value: string;
};

type YogaSport = {
  id: string;
  name: string;
  slug: string;
  maxPlayers: number;
  pricing: Array<{
    duration: number;
    price: number | string;
  }>;
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

function toTimeValue(minutesFromMidnight: number): string {
  const hours = Math.floor(minutesFromMidnight / 60);
  const minutes = minutesFromMidnight % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatTime(minutesFromMidnight: number): string {
  const hours = Math.floor(minutesFromMidnight / 60);
  const minutes = minutesFromMidnight % 60;
  const displayHours = hours % 12 || 12;

  return `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} AM`;
}

function parseTimeValue(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);

  return hours * 60 + minutes;
}

function getYogaTimeOptions(
  durationMinutes: number | ""
): YogaTimeOption[] {
  if (durationMinutes === "") {
    return [];
  }

  const options: YogaTimeOption[] = [];

  for (
    let startMinutes = YOGA_OPENING_MINUTES;
    startMinutes + durationMinutes <= YOGA_CLOSING_MINUTES;
    startMinutes += YOGA_START_INTERVAL_MINUTES
  ) {
    options.push({
      label: formatTime(startMinutes),
      value: toTimeValue(startMinutes),
    });
  }

  return options;
}

export default function YogaBookingForm({
  onBookingCreated,
  onBookingError,
  setBookingLoading,
}: YogaBookingFormProps) {
  const prefersReducedMotion = useReducedMotion();
  const bookingDateInputRef = useRef<HTMLInputElement>(null);
  const [yogaSport, setYogaSport] = useState<YogaSport | null>(null);
  const [loadingSport, setLoadingSport] = useState(true);
  const [sportError, setSportError] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [today, setToday] = useState("");
  const [numberOfPlayers, setNumberOfPlayers] = useState(1);
  const [durationMinutes, setDurationMinutes] =
    useState<number | "">("");
  const [startTime, setStartTime] = useState("");
  const [mobile, setMobile] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const todayFrame = window.requestAnimationFrame(() => {
      setToday(getToday());
    });

    async function loadYogaSport() {
      try {
        const response = await fetch("/api/sports", {
          method: "GET",
          cache: "no-store",
        });
        const result = await response.json();
        const sport = (result.sports ?? []).find(
          (item: YogaSport) => item.slug === "yoga"
        );

        if (!response.ok || !result.success || !sport) {
          throw new Error("Yoga booking is currently unavailable.");
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

    return () => {
      window.cancelAnimationFrame(todayFrame);
    };
  }, []);

  const availableTimeOptions = getYogaTimeOptions(durationMinutes);
  const selectedDuration = YOGA_DURATION_OPTIONS.find(
    (option) => option.minutes === durationMinutes
  );
  const selectedPricing =
    durationMinutes === ""
      ? undefined
      : yogaSport?.pricing.find(
          (pricing) => pricing.duration === durationMinutes
        );
  const perPersonPrice = selectedPricing
    ? Number(selectedPricing.price)
    : null;
  const totalPrice =
    perPersonPrice === null
      ? null
      : perPersonPrice * numberOfPlayers;

  const handleDurationChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const nextDuration = event.target.value
      ? Number(event.target.value)
      : "";
    const nextTimeOptions = getYogaTimeOptions(nextDuration);

    setDurationMinutes(nextDuration);

    if (
      startTime &&
      !nextTimeOptions.some((option) => option.value === startTime)
    ) {
      setStartTime("");
    }
  };

  const handleBookingDateClick = (
    event: React.MouseEvent<HTMLInputElement>
  ) => {
    const input = bookingDateInputRef.current;

    if (!input) {
      return;
    }

    input.focus();

    if (typeof input.showPicker !== "function") {
      return;
    }

    try {
      input.showPicker();
      event.preventDefault();
    } catch {
      // Native focus and click behavior remain the fallback.
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setFormError("");
    onBookingError("");

    if (!yogaSport) {
      setFormError("Yoga booking is currently unavailable.");
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

    if (!bookingDate || (today && bookingDate < today)) {
      setFormError("Please select a valid booking date.");
      return;
    }

    if (
      !Number.isInteger(numberOfPlayers) ||
      numberOfPlayers < 1 ||
      numberOfPlayers > yogaSport.maxPlayers
    ) {
      setFormError(
        `Choose between 1 and ${yogaSport.maxPlayers} persons.`
      );
      return;
    }

    if (!selectedDuration) {
      setFormError("Please select a duration.");
      return;
    }

    if (
      !startTime ||
      !availableTimeOptions.some((option) => option.value === startTime)
    ) {
      setFormError("Please select an available time.");
      return;
    }

    if (
      perPersonPrice === null ||
      !Number.isFinite(perPersonPrice)
    ) {
      setFormError(
        "Pricing is unavailable for the selected duration."
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(normalizedMobile)) {
      setFormError("Enter a valid Indian mobile number.");
      return;
    }

    const startMinutes = parseTimeValue(startTime);
    const endTime = toTimeValue(
      startMinutes + selectedDuration.minutes
    );
    const timeLabel =
      `${formatTime(startMinutes)} – ${formatTime(
        startMinutes + selectedDuration.minutes
      )}`;

    try {
      setBookingLoading(true);

      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          sportId: yogaSport.id,
          bookingDate,
          startTime,
          endTime,
          numberOfPlayers,
          fullName: trimmedName,
          email: trimmedEmail,
          mobile: normalizedMobile,
        }),
      });

      const result = await response.json();

      if (
        !response.ok ||
        !result.success ||
        !result.data?.booking?.id
      ) {
        throw new Error(
          result.message ?? "Unable to create Yoga booking."
        );
      }

      const booking = result.data.booking;
      const createdBooking: CreatedBooking = {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        sportName: "Yoga",
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
          time: timeLabel,
          duration: selectedDuration.label,
          durationMinutes: selectedDuration.minutes,
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

  const inputClassName =
    "w-full min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none transition focus:border-amber-200/60 focus:ring-2 focus:ring-amber-100/10";

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
        <label htmlFor="yoga-full-name" className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-white/65">
          Full Name
        </label>
        <input
          id="yoga-full-name"
          type="text"
          required
          maxLength={100}
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="yoga-email" className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-white/65">
          Email ID
        </label>
        <input
          id="yoga-email"
          type="email"
          required
          maxLength={255}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="yoga-booking-date" className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-white/65">
          Booking Date
        </label>
        <input
          ref={bookingDateInputRef}
          id="yoga-booking-date"
          type="date"
          required
          min={today}
          value={bookingDate}
          onClick={handleBookingDateClick}
          onChange={(event) => setBookingDate(event.target.value)}
          className={`${inputClassName} cursor-pointer color-scheme-dark`}
        />
      </div>

      <div>
        <label htmlFor="yoga-persons" className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-white/65">
          Number of Persons
        </label>
        <input
          id="yoga-persons"
          type="number"
          required
          min={1}
          max={yogaSport?.maxPlayers ?? 30}
          value={numberOfPlayers}
          onChange={(event) =>
            setNumberOfPlayers(Number(event.target.value))
          }
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="yoga-duration" className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-white/65">
          Duration
        </label>
        <select
          id="yoga-duration"
          required
          value={durationMinutes}
          onChange={handleDurationChange}
          className={inputClassName}
        >
          <option value="">Select duration</option>
          {YOGA_DURATION_OPTIONS.map((option) => (
            <option key={option.minutes} value={option.minutes}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="yoga-available-time" className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-white/65">
          Available Time
        </label>
        <select
          id="yoga-available-time"
          required
          disabled={durationMinutes === ""}
          value={startTime}
          onChange={(event) => setStartTime(event.target.value)}
          className={`${inputClassName} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <option value="">
            {durationMinutes === ""
              ? "Select duration first"
              : "Select available time"}
          </option>
          {availableTimeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="yoga-mobile" className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-white/65">
          Mobile Number
        </label>
        <input
          id="yoga-mobile"
          type="tel"
          required
          maxLength={10}
          value={mobile}
          onChange={(event) => setMobile(event.target.value)}
          className={inputClassName}
        />
      </div>

      <div className="rounded-2xl border border-amber-200/20 bg-gradient-to-br from-amber-100/[0.09] to-[#B6F000]/[0.04] p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/70">
          Price Summary
        </p>
        {perPersonPrice !== null && totalPrice !== null ? (
          <>
            <p className="mt-2 text-lg font-semibold text-[#B6F000]">
              ₹{perPersonPrice.toLocaleString("en-IN")} × {numberOfPlayers}{" "}
              {numberOfPlayers === 1 ? "person" : "persons"}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              Total ₹{totalPrice.toLocaleString("en-IN")}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-white/60">
            Select a duration to view the exact price.
          </p>
        )}
      </div>

      {formError && (
        <p role="alert" className="text-sm text-red-400">
          {formError}
        </p>
      )}

      <button
        type="submit"
        className="min-h-12 w-full rounded-2xl bg-amber-200 px-5 py-3 font-bold text-[#21170e] shadow-[0_10px_30px_rgba(242,184,92,0.15)] transition duration-200 hover:-translate-y-0.5 hover:bg-amber-100 hover:shadow-[0_14px_36px_rgba(242,184,92,0.22)] active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-[#11100d]"
      >
        Proceed to Payment
      </button>
    </motion.form>
  );
}
