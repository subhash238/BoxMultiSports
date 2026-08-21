"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  BookingData,
  CreatedBooking,
} from "@/components/booking-widget/BookingWidget";

import { validateEmail } from "@/components/booking-widget/validators";

type GymPricing = {
  duration: number;
  price: string;
};

type GymSport = {
  id: string;
  name: string;
  slug: string;
  maxPlayers: number;
  isActive: boolean;
  pricing: GymPricing[];
};

type GymBookingFormProps = {
  onBookingCreated: (result: {
    booking: CreatedBooking;
    guestPaymentToken: string | null;
    bookingData: BookingData;
  }) => void;

  onBookingError: (message: string) => void;

  setBookingLoading: (
    loading: boolean
  ) => void;
};

const DURATIONS = [
  60,
  90,
  120,
] as const;

const GYM_OPENING_MINUTES =
  5 * 60;

const GYM_CLOSING_MINUTES =
  23 * 60;

function getToday(): string {
  const today =
    new Date();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      today.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${today.getFullYear()}-${month}-${day}`;
}

function minutesToTimeValue(
  totalMinutes: number
): string {
  const hours =
    Math.floor(
      totalMinutes / 60
    );

  const minutes =
    totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function timeValueToMinutes(
  value: string
): number {
  const [
    hours,
    minutes,
  ] =
    value
      .split(":")
      .map(Number);

  return (
    hours * 60 +
    minutes
  );
}

function formatTime(
  value: string
): string {
  const [
    hoursValue,
    minutesValue,
  ] =
    value
      .split(":")
      .map(Number);

  const suffix =
    hoursValue >= 12
      ? "PM"
      : "AM";

  const displayHour =
    hoursValue % 12 || 12;

  return `${displayHour}:${String(minutesValue).padStart(2, "0")} ${suffix}`;
}

function formatDuration(
  durationMinutes: number
): string {
  if (
    durationMinutes === 60
  ) {
    return "1 Hour";
  }

  if (
    durationMinutes === 90
  ) {
    return "1 Hour 30 Minutes";
  }

  if (
    durationMinutes === 120
  ) {
    return "2 Hours";
  }

  return `${durationMinutes} Minutes`;
}

function getEndTime(
  startTime: string,
  durationMinutes: number
): string {
  const startMinutes =
    timeValueToMinutes(
      startTime
    );

  return minutesToTimeValue(
    startMinutes +
      durationMinutes
  );
}

export default function GymBookingForm({
  onBookingCreated,
  onBookingError,
  setBookingLoading,
}: GymBookingFormProps) {
  const prefersReducedMotion =
    useReducedMotion();

  const [
    gymSport,
    setGymSport,
  ] =
    useState<GymSport | null>(
      null
    );

  const [
    loadingSport,
    setLoadingSport,
  ] =
    useState(true);

  const [
    sportError,
    setSportError,
  ] =
    useState("");

  const [
    bookingDate,
    setBookingDate,
  ] =
    useState("");

  const [
    today,
    setToday,
  ] =
    useState("");

  const [
    startTime,
    setStartTime,
  ] =
    useState("");

  const [
    duration,
    setDuration,
  ] =
    useState<number>(
      60
    );

  const [
    numberOfPlayers,
    setNumberOfPlayers,
  ] =
    useState(1);

  const [
    fullName,
    setFullName,
  ] =
    useState("");

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    mobile,
    setMobile,
  ] =
    useState("");

  const [
    formError,
    setFormError,
  ] =
    useState("");

  useEffect(() => {
    setToday(
      getToday()
    );

    async function loadGymSport() {
      try {
        const response =
          await fetch(
            "/api/sports",
            {
              method:
                "GET",
              cache:
                "no-store",
            }
          );

        const result =
          await response.json();

        const sport =
          (
            result.sports ??
            []
          ).find(
            (
              item: GymSport
            ) =>
              item.slug ===
              "gym"
          );

        if (
          !response.ok ||
          !result.success ||
          !sport ||
          !sport.isActive
        ) {
          throw new Error(
            "Gym booking is currently unavailable."
          );
        }

        const hasRequiredPricing =
          DURATIONS.every(
            (
              durationValue
            ) => {
              const pricing =
                sport.pricing?.find(
                  (
                    item:
                      GymPricing
                  ) =>
                    item.duration ===
                    durationValue
                );

              const price =
                Number(
                  pricing?.price
                );

              return (
                pricing !==
                  undefined &&
                Number.isFinite(
                  price
                ) &&
                price > 0
              );
            }
          );

        if (
          !hasRequiredPricing
        ) {
          throw new Error(
            "Gym pricing is currently unavailable."
          );
        }

        setGymSport(
          sport
        );
      } catch (error) {
        setSportError(
          error instanceof
            Error
            ? error.message
            : "Gym booking is currently unavailable."
        );
      } finally {
        setLoadingSport(
          false
        );
      }
    }

    loadGymSport();
  }, []);

  const unitPrice =
    useMemo(() => {
      if (
        !gymSport
      ) {
        return 0;
      }

      const pricing =
        gymSport.pricing.find(
          (
            item
          ) =>
            item.duration ===
            duration
        );

      if (
        !pricing
      ) {
        return 0;
      }

      const price =
        Number(
          pricing.price
        );

      return Number.isFinite(
        price
      )
        ? price
        : 0;
    }, [
      gymSport,
      duration,
    ]);

  const startOptions =
    useMemo(() => {
      const latestStart =
        GYM_CLOSING_MINUTES -
        duration;

      const options: {
        value: string;
        label: string;
      }[] = [];

      for (
        let minutes =
          GYM_OPENING_MINUTES;
        minutes <=
        latestStart;
        minutes += 30
      ) {
        const value =
          minutesToTimeValue(
            minutes
          );

        options.push({
          value,
          label:
            formatTime(
              value
            ),
        });
      }

      return options;
    }, [
      duration,
    ]);

  useEffect(() => {
    if (
      startTime &&
      !startOptions.some(
        (
          option
        ) =>
          option.value ===
          startTime
      )
    ) {
      setStartTime(
        ""
      );
    }
  }, [
    startOptions,
    startTime,
  ]);

  const endTime =
    startTime
      ? getEndTime(
          startTime,
          duration
        )
      : "";

  const estimatedTotal =
    unitPrice *
    numberOfPlayers;

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setFormError(
        ""
      );

      onBookingError(
        ""
      );

      if (
        !gymSport
      ) {
        setFormError(
          "Gym booking is currently unavailable."
        );

        return;
      }

      if (
        !bookingDate ||
        (
          today &&
          bookingDate <
            today
        )
      ) {
        setFormError(
          "Please select a valid booking date."
        );

        return;
      }

      if (
        !DURATIONS.includes(
          duration as
            (typeof DURATIONS)[number]
        )
      ) {
        setFormError(
          "Please select a valid Gym duration."
        );

        return;
      }

      if (
        !startTime ||
        !startOptions.some(
          (
            option
          ) =>
            option.value ===
            startTime
        ) ||
        !endTime
      ) {
        setFormError(
          "Please select a valid Gym start time."
        );

        return;
      }

      if (
        unitPrice <= 0
      ) {
        setFormError(
          "Gym pricing is currently unavailable."
        );

        return;
      }

      if (
        !Number.isInteger(
          numberOfPlayers
        ) ||
        numberOfPlayers <
          1 ||
        numberOfPlayers >
          gymSport.maxPlayers
      ) {
        setFormError(
          `Choose between 1 and ${gymSport.maxPlayers} participants.`
        );

        return;
      }

      const trimmedName =
        fullName.trim();

      const trimmedEmail =
        email.trim();

      const normalizedMobile =
        mobile.replace(
          /\D/g,
          ""
        );

      if (
        !trimmedName ||
        trimmedName.length >
          100 ||
        !/^[A-Za-z]/.test(
          trimmedName
        )
      ) {
        setFormError(
          "Please enter a valid full name."
        );

        return;
      }

      const emailError =
        validateEmail(
          trimmedEmail
        );

      if (
        emailError
      ) {
        setFormError(
          emailError
        );

        return;
      }

      if (
        !/^[6-9]\d{9}$/.test(
          normalizedMobile
        )
      ) {
        setFormError(
          "Enter a valid Indian mobile number."
        );

        return;
      }

      try {
        setBookingLoading(
          true
        );

        const response =
          await fetch(
            "/api/booking",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body:
                JSON.stringify({
                  sportId:
                    gymSport.id,

                  bookingDate,

                  startTime,

                  endTime,

                  durationMinutes:
                    duration,

                  numberOfPlayers,

                  fullName:
                    trimmedName,

                  email:
                    trimmedEmail,

                  mobile:
                    normalizedMobile,
                }),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success ||
          !result.data
            ?.booking?.id
        ) {
          throw new Error(
            result.message ??
              "Unable to create Gym booking."
          );
        }

        const booking =
          result.data.booking;

        const createdBooking:
          CreatedBooking =
          {
            id:
              booking.id,

            bookingNumber:
              booking.bookingNumber,

            bookingDate:
              booking.bookingDate,

            startTime:
              booking.startTime,

            endTime:
              booking.endTime,

            duration:
              booking.duration,

            totalAmount:
              booking.totalAmount,

            status:
              booking.status,
          };

        onBookingCreated({
          booking:
            createdBooking,

          guestPaymentToken:
            typeof result.data
              .guestPaymentToken ===
            "string"
              ? result.data
                  .guestPaymentToken
              : null,

          bookingData: {
            sport:
              "Gym",

            date:
              bookingDate,

            time:
              `${formatTime(startTime)} – ${formatTime(endTime)}`,

            duration:
              formatDuration(
                duration
              ),

            players:
              numberOfPlayers,

            fullName:
              trimmedName,

            email:
              trimmedEmail,

            mobile:
              normalizedMobile,

            specialRequest:
              "",
          },
        });
      } catch (error) {
        const message =
          error instanceof
            Error
            ? error.message
            : "Unable to create Gym booking.";

        setFormError(
          message
        );

        onBookingError(
          message
        );
      } finally {
        setBookingLoading(
          false
        );
      }
    };

  if (
    loadingSport
  ) {
    return (
      <p className="text-white/60">
        Loading Gym booking...
      </p>
    );
  }

  if (
    sportError
  ) {
    return (
      <p className="text-red-400">
        {sportError}
      </p>
    );
  }

  return (
    <motion.form
      onSubmit={
        handleSubmit
      }
      initial={
        prefersReducedMotion
          ? false
          : {
              opacity: 0,
              y: 10,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration:
          prefersReducedMotion
            ? 0
            : 0.4,
      }}
      className="space-y-7"
    >
      <div className="border-b border-white/[0.08] pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#B6F000]">
          Gym session
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
          Choose your training
          window.
        </h2>

        <p className="mt-2 text-sm leading-6 text-white/45">
          Choose a 60, 90 or
          120 minute session.
          Pricing is calculated
          per participant for the
          selected duration.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/60">
          Full Name
        </label>

        <input
          type="text"
          required
          maxLength={
            100
          }
          value={
            fullName
          }
          onChange={(
            event
          ) =>
            setFullName(
              event.target
                .value
            )
          }
          className="w-full rounded-2xl border border-white/[0.12] bg-black/20 px-4 py-3.5 text-white outline-none transition hover:border-white/25 focus:border-[#B6F000]/70 focus:ring-2 focus:ring-[#B6F000]/10"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/60">
          Email ID
        </label>

        <input
          type="email"
          required
          maxLength={
            255
          }
          value={
            email
          }
          onChange={(
            event
          ) =>
            setEmail(
              event.target
                .value
            )
          }
          className="w-full rounded-2xl border border-white/[0.12] bg-black/20 px-4 py-3.5 text-white outline-none transition hover:border-white/25 focus:border-[#B6F000]/70 focus:ring-2 focus:ring-[#B6F000]/10"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/60">
          Booking Date
        </label>

        <input
          type="date"
          required
          min={
            today
          }
          value={
            bookingDate
          }
          onClick={(event) => {
            event.currentTarget.showPicker?.();
          }}
          onChange={(
            event
          ) =>
            setBookingDate(
              event.target
                .value
            )
          }
          className="w-full rounded-2xl border border-white/[0.12] bg-black/20 px-4 py-3.5 text-white outline-none transition hover:border-white/25 focus:border-[#B6F000]/70 focus:ring-2 focus:ring-[#B6F000]/10 color-scheme-dark"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/60">
          Number of Persons
        </label>

        <input
          type="number"
          required
          min={
            1
          }
          max={
            gymSport
              ?.maxPlayers ??
            25
          }
          step={
            1
          }
          value={
            numberOfPlayers
          }
          onChange={(
            event
          ) =>
            setNumberOfPlayers(
              Number(
                event.target
                  .value
              )
            )
          }
          className="w-full rounded-2xl border border-white/[0.12] bg-black/20 px-4 py-3.5 text-white outline-none transition hover:border-white/25 focus:border-[#B6F000]/70 focus:ring-2 focus:ring-[#B6F000]/10"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/60">
            Duration
          </label>

          <select
            required
            value={
              duration
            }
            onChange={(
              event
            ) =>
              setDuration(
                Number(
                  event.target
                    .value
                )
              )
            }
            className="w-full rounded-2xl border border-white/[0.12] bg-black/20 px-4 py-3.5 text-white outline-none transition hover:border-white/25 focus:border-[#B6F000]/70 focus:ring-2 focus:ring-[#B6F000]/10"
          >
            {DURATIONS.map(
              (
                durationValue
              ) => {
                const pricing =
                  gymSport?.pricing.find(
                    (
                      item
                    ) =>
                      item.duration ===
                      durationValue
                  );

                const price =
                  Number(
                    pricing?.price ??
                      0
                  );

                return (
                  <option
                    key={
                      durationValue
                    }
                    value={
                      durationValue
                    }
                  >
                    {formatDuration(
                      durationValue
                    )}{" "}
                    — ₹
                    {price.toLocaleString(
                      "en-IN"
                    )}
                    /person
                  </option>
                );
              }
            )}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/60">
            Start Time
          </label>

          <select
            required
            value={
              startTime
            }
            onChange={(
              event
            ) =>
              setStartTime(
                event.target
                  .value
              )
            }
            className="w-full rounded-2xl border border-white/[0.12] bg-black/20 px-4 py-3.5 text-white outline-none transition hover:border-white/25 focus:border-[#B6F000]/70 focus:ring-2 focus:ring-[#B6F000]/10"
          >
            <option value="">
              Select a time
            </option>

            {startOptions.map(
              (
                option
              ) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {
                    option.label
                  }
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {startTime &&
        endTime && (
          <p className="-mt-3 text-sm text-white/45">
            Session:{" "}
            {formatTime(
              startTime
            )}{" "}
            –{" "}
            {formatTime(
              endTime
            )}
          </p>
        )}

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-white/60">
          Mobile Number
        </label>

        <input
          type="tel"
          required
          maxLength={
            10
          }
          inputMode="numeric"
          value={
            mobile
          }
          onChange={(
            event
          ) =>
            setMobile(
              event.target
                .value
            )
          }
          className="w-full rounded-2xl border border-white/[0.12] bg-black/20 px-4 py-3.5 text-white outline-none transition hover:border-white/25 focus:border-[#B6F000]/70 focus:ring-2 focus:ring-[#B6F000]/10"
        />
      </div>

      <div className="rounded-2xl border border-[#B6F000]/25 bg-gradient-to-br from-[#B6F000]/[0.1] via-white/[0.03] to-transparent p-5 text-white shadow-[0_12px_40px_rgba(182,240,0,0.07)]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#B6F000]/80">
          Price Summary
        </p>

        <p className="mt-2 text-lg font-bold text-[#B6F000]">
          ₹
          {unitPrice.toLocaleString(
            "en-IN"
          )}{" "}
          ×{" "}
          {numberOfPlayers}{" "}
          {numberOfPlayers ===
          1
            ? "participant"
            : "participants"}
        </p>

        <p className="mt-2 text-sm text-white/50">
          {
            formatDuration(
              duration
            )
          }{" "}
          Gym session
        </p>

        <p className="mt-2 text-3xl font-black tracking-tight">
          Total: ₹
          {estimatedTotal.toLocaleString(
            "en-IN"
          )}
        </p>

        <p className="mt-3 text-xs leading-5 text-white/45">
          Shared Gym capacity
          is checked for your
          selected time.
        </p>
      </div>

      {formError && (
        <p className="text-sm text-red-400">
          {formError}
        </p>
      )}

      <button
        type="submit"
        className="min-h-12 w-full rounded-2xl bg-[#B6F000] px-5 py-3 font-black uppercase tracking-[0.12em] text-[#10130b] shadow-[0_10px_30px_rgba(182,240,0,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#c8ff2e] hover:shadow-[0_14px_36px_rgba(182,240,0,0.28)] active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#B6F000] focus:ring-offset-2 focus:ring-offset-[#101312]"
      >
        Proceed to Payment
      </button>
    </motion.form>
  );
}