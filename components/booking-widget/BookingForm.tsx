"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";

import BookingField from "./BookingField";

import {
  BookingData,
  CreatedBooking,
} from "./BookingWidget";

import { useBookingValidation } from "./hooks/useBookingValidation";

// ==========================================
// Sport Type
// ==========================================

interface Sport {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  pricePerHour?: number | string;
  maxPlayers?: number | null;
  imageUrl?: string | null;
  isActive?: boolean;
}

// ==========================================
// Props
// ==========================================

interface BookingFormProps {
  bookingData: BookingData;

  setBookingData: React.Dispatch<
    React.SetStateAction<BookingData>
  >;

  onBookingCreated: (
    booking: CreatedBooking
  ) => void;

  onBookingError: (
    message: string
  ) => void;

  setBookingLoading: (
    loading: boolean
  ) => void;
}

// ==========================================
// Convert 12 Hour Time → 24 Hour Time
// ==========================================

function convertTo24Hour(time: string): string {
  const [timePart, period] = time.split(" ");

  const [hourString, minuteString] =
    timePart.split(":");

  let hour = Number(hourString);
  const minute = Number(minuteString);

  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    throw new Error("Invalid time selected.");
  }

  if (period === "AM") {
    if (hour === 12) {
      hour = 0;
    }
  }

  if (period === "PM") {
    if (hour !== 12) {
      hour += 12;
    }
  }

  return `${String(hour).padStart(
    2,
    "0"
  )}:${String(minute).padStart(2, "0")}`;
}

// ==========================================
// Add Duration To Time
// ==========================================

function addDurationToTime(
  startTime: string,
  duration: string
): string {
  const [hoursString, minutesString] =
    startTime.split(":");

  const hours = Number(hoursString);
  const minutes = Number(minutesString);

  const durationHours =
    Number.parseInt(duration, 10);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    !Number.isFinite(durationHours)
  ) {
    throw new Error(
      "Invalid booking time or duration."
    );
  }

  const totalMinutes =
    hours * 60 +
    minutes +
    durationHours * 60;

  if (totalMinutes >= 24 * 60) {
    throw new Error(
      "Booking cannot extend beyond midnight."
    );
  }

  const endHours = Math.floor(
    totalMinutes / 60
  );

  const endMinutes =
    totalMinutes % 60;

  return `${String(endHours).padStart(
    2,
    "0"
  )}:${String(endMinutes).padStart(2, "0")}`;
}

// ==========================================
// Component
// ==========================================

export default function BookingForm({
  bookingData,
  setBookingData,
  onBookingCreated,
  onBookingError,
  setBookingLoading,
}: BookingFormProps) {
  // ==========================================
  // Sports
  // ==========================================

  const [sports, setSports] =
    useState<Sport[]>([]);

  const [sportsLoading, setSportsLoading] =
    useState(true);

  const [sportsError, setSportsError] =
    useState("");

  // ==========================================
  // Validation
  // ==========================================

  const {
    errors,
    touched,
    isValid,
    updateField,
    handleBlur,
    markAllTouched,
  } = useBookingValidation(
    bookingData,
    setBookingData
  );

  // ==========================================
  // Fetch Sports
  // ==========================================

  useEffect(() => {
    async function fetchSports() {
      try {
        setSportsLoading(true);
        setSportsError("");

        const response = await fetch(
          "/api/sports",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ??
              "Unable to load sports."
          );
        }

        setSports(
          result.sports ?? []
        );
      } catch (error) {
        console.error(
          "Fetch sports error:",
          error
        );

        setSportsError(
          error instanceof Error
            ? error.message
            : "Unable to load sports."
        );
      } finally {
        setSportsLoading(false);
      }
    }

    fetchSports();
  }, []);

  // ==========================================
  // Continue Booking
  // ==========================================

  const handleContinue = async () => {
    markAllTouched();

    if (!isValid) {
      return;
    }

    try {
      setBookingLoading(true);
      onBookingError("");

      // ---------------------------------------
      // Validate Sport
      // ---------------------------------------

      if (!bookingData.sport) {
        throw new Error(
          "Please select a sport."
        );
      }

      // ---------------------------------------
      // Convert Start Time
      // ---------------------------------------

      const startTime =
        convertTo24Hour(
          bookingData.time
        );

      // ---------------------------------------
      // Calculate End Time
      // ---------------------------------------

      const endTime =
        addDurationToTime(
          startTime,
          bookingData.duration
        );

      // ---------------------------------------
      // Create Booking
      // ---------------------------------------

      const response = await fetch(
        "/api/booking",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            sportId:
              bookingData.sport,

            bookingDate:
              bookingData.date,

            startTime,

            endTime,

            numberOfPlayers:
              bookingData.players,
          }),
        }
      );

      // ---------------------------------------
      // Read Response
      // ---------------------------------------

      const result =
        await response.json();

      // ---------------------------------------
      // API Error
      // ---------------------------------------

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ??
            "Unable to create booking."
        );
      }

      // ---------------------------------------
      // Validate Booking Response
      // ---------------------------------------

      if (!result.data?.id) {
        throw new Error(
          "Booking was created but booking information was not returned."
        );
      }

      // ---------------------------------------
      // Prepare Booking
      // ---------------------------------------

      const booking =
        result.data;

      const createdBooking:
        CreatedBooking = {
        id: booking.id,

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

      console.log(
        "Booking created successfully:",
        createdBooking
      );

      // ---------------------------------------
      // Open Payment Modal
      // ---------------------------------------

      onBookingCreated(
        createdBooking
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create booking.";

      console.error(
        "Booking creation error:",
        error
      );

      onBookingError(message);
    } finally {
      setBookingLoading(false);
    }
  };

  // ==========================================
  // Premium Select Styles
  // ==========================================

  const selectBase = `
    h-[56px]
    w-full
    appearance-none
    rounded-[14px]
    border
    bg-white/[0.035]
    px-4
    pr-11
    text-[14px]
    font-medium
    text-white
    outline-none
    transition-all
    duration-200
    backdrop-blur-sm
    color-scheme-dark
  `;

  const selectNormal = `
    ${selectBase}
    border-white/[0.10]
    hover:border-white/[0.18]
    hover:bg-white/[0.05]
    focus:border-[#B6F000]/70
    focus:bg-white/[0.055]
    focus:ring-4
    focus:ring-[#B6F000]/10
  `;

  const selectError = `
    ${selectBase}
    border-red-500/60
    focus:border-red-500
    focus:ring-4
    focus:ring-red-500/10
  `;

  const selectSuccess = `
    ${selectBase}
    border-[#B6F000]/40
    focus:border-[#B6F000]
    focus:ring-4
    focus:ring-[#B6F000]/10
  `;

  // ==========================================
  // Section Header
  // ==========================================

  const SectionHeader = ({
    number,
    title,
    description,
  }: {
    number: string;
    title: string;
    description: string;
  }) => (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <span
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-[#B6F000]/20
            bg-[#B6F000]/[0.08]
            text-[10px]
            font-bold
            text-[#B6F000]
          "
        >
          {number}
        </span>

        <h3
          className="
            text-[15px]
            font-semibold
            tracking-[-0.01em]
            text-white
          "
        >
          {title}
        </h3>
      </div>

      <p
        className="
          mt-2
          pl-11
          text-xs
          leading-5
          text-white/35
        "
      >
        {description}
      </p>
    </div>
  );

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="w-full">

      {/* ======================================
          Header
      ====================================== */}

      <div className="mb-8">
        <div
          className="
            mb-3
            flex
            items-center
            gap-2
          "
        >
          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-[#B6F000]
              shadow-[0_0_12px_rgba(182,240,0,0.8)]
            "
          />

          <span
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.24em]
              text-[#B6F000]
            "
          >
            UniTurf Booking
          </span>
        </div>

        <h2
          className="
            text-3xl
            font-semibold
            tracking-[-0.045em]
            text-white
            sm:text-4xl
          "
        >
          Book your game.
        </h2>

        <p
          className="
            mt-3
            max-w-xl
            text-sm
            leading-6
            text-white/40
          "
        >
          Choose your sport, select your time,
          and reserve your game in less than
          one minute.
        </p>
      </div>

      {/* ======================================
          Form Surface
      ====================================== */}

      <div
        className="
          overflow-hidden
          rounded-[24px]
          border
          border-white/[0.08]
          bg-white/[0.025]
          shadow-[0_25px_80px_rgba(0,0,0,0.25)]
          backdrop-blur-xl
        "
      >

        <div className="p-5 sm:p-7 lg:p-8">

          {/* ==================================
              GAME DETAILS
          ================================== */}

          <section>
            <SectionHeader
              number="01"
              title="Game details"
              description="Select your sport and preferred date."
            />

            <div
              className="
                grid
                gap-5
                md:grid-cols-2
              "
            >

              {/* Sport */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-[12px]
                    font-medium
                    text-white/55
                  "
                >
                  Sport
                  <span className="ml-1 text-[#B6F000]">
                    *
                  </span>
                </label>

                <div className="relative">
                  <select
                    value={bookingData.sport}
                    onChange={(e) =>
                      updateField(
                        "sport",
                        e.target.value
                      )
                    }
                    onBlur={() =>
                      handleBlur("sport")
                    }
                    disabled={sportsLoading}
                    className={
                      touched.sport &&
                      errors.sport
                        ? selectError
                        : touched.sport
                          ? selectSuccess
                          : selectNormal
                    }
                  >
                    <option
                      value=""
                      className="bg-[#11130F] text-white"
                    >
                      {sportsLoading
                        ? "Loading sports..."
                        : "Select sport"}
                    </option>

                    {sports.map(
                      (sport) => (
                        <option
                          key={sport.id}
                          value={sport.id}
                          className="
                            bg-[#11130F]
                            text-white
                          "
                        >
                          {sport.name}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={17}
                    className="
                      pointer-events-none
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-white/40
                    "
                  />
                </div>

                {sportsError && (
                  <p
                    className="
                      mt-2
                      text-xs
                      text-red-400
                    "
                  >
                    {sportsError}
                  </p>
                )}

                {touched.sport &&
                  errors.sport && (
                    <p
                      className="
                        mt-2
                        text-xs
                        text-red-400
                      "
                    >
                      {errors.sport}
                    </p>
                  )}
              </div>

              {/* Date */}

              <BookingField
                label="Booking Date"
                type="date"
                required
                value={bookingData.date}
                onChange={(e) =>
                  updateField(
                    "date",
                    e.target.value
                  )
                }
                onBlur={() =>
                  handleBlur("date")
                }
                error={
                  touched.date
                    ? errors.date
                    : undefined
                }
                success={
                  touched.date &&
                  !errors.date
                }
                className="
                  !border-white/[0.10]
                  !bg-white/[0.035]
                  !text-white
                  color-scheme-dark
                  placeholder:!text-white/25
                  focus:!border-[#B6F000]/70
                  focus:!ring-[#B6F000]/10
                "
              />
            </div>
          </section>

          {/* ==================================
              DIVIDER
          ================================== */}

          <div
            className="
              my-8
              h-px
              bg-gradient-to-r
              from-transparent
              via-white/[0.08]
              to-transparent
            "
          />

          {/* ==================================
              TIME & DURATION
          ================================== */}

          <section>
            <SectionHeader
              number="02"
              title="Time & duration"
              description="Pick when you want to play and for how long."
            />

            <div
              className="
                grid
                gap-5
                md:grid-cols-2
              "
            >

              {/* Start Time */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-[12px]
                    font-medium
                    text-white/55
                  "
                >
                  Start time
                  <span className="ml-1 text-[#B6F000]">
                    *
                  </span>
                </label>

                <div className="relative">
                  <select
                    value={bookingData.time}
                    onChange={(e) =>
                      updateField(
                        "time",
                        e.target.value
                      )
                    }
                    onBlur={() =>
                      handleBlur("time")
                    }
                    className={
                      touched.time &&
                      errors.time
                        ? selectError
                        : touched.time
                          ? selectSuccess
                          : selectNormal
                    }
                  >
                    <option
                      value=""
                      className="bg-[#11130F] text-white"
                    >
                      Select time
                    </option>

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

                  <ChevronDown
                    size={17}
                    className="
                      pointer-events-none
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-white/40
                    "
                  />
                </div>

                {touched.time &&
                  errors.time && (
                    <p
                      className="
                        mt-2
                        text-xs
                        text-red-400
                      "
                    >
                      {errors.time}
                    </p>
                  )}
              </div>

              {/* Duration */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-[12px]
                    font-medium
                    text-white/55
                  "
                >
                  Duration
                  <span className="ml-1 text-[#B6F000]">
                    *
                  </span>
                </label>

                <div className="relative">
                  <select
                    value={
                      bookingData.duration
                    }
                    onChange={(e) =>
                      updateField(
                        "duration",
                        e.target.value
                      )
                    }
                    onBlur={() =>
                      handleBlur("duration")
                    }
                    className={
                      touched.duration &&
                      errors.duration
                        ? selectError
                        : touched.duration
                          ? selectSuccess
                          : selectNormal
                    }
                  >
                    <option
                      value=""
                      className="bg-[#11130F] text-white"
                    >
                      Select duration
                    </option>

                    <option>1 Hour</option>
                    <option>2 Hours</option>
                    <option>3 Hours</option>
                    <option>4 Hours</option>
                    <option>5 Hours</option>
                    <option>12 Hours</option>
                  </select>

                  <ChevronDown
                    size={17}
                    className="
                      pointer-events-none
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-white/40
                    "
                  />
                </div>

                {touched.duration &&
                  errors.duration && (
                    <p
                      className="
                        mt-2
                        text-xs
                        text-red-400
                      "
                    >
                      {errors.duration}
                    </p>
                  )}
              </div>
            </div>
          </section>

          {/* ==================================
              DIVIDER
          ================================== */}

          <div
            className="
              my-8
              h-px
              bg-gradient-to-r
              from-transparent
              via-white/[0.08]
              to-transparent
            "
          />

          {/* ==================================
              PLAYER DETAILS
          ================================== */}

          <section>
            <SectionHeader
              number="03"
              title="Your details"
              description="Tell us who is joining the game."
            />

            <div
              className="
                grid
                gap-5
                md:grid-cols-2
              "
            >

              {/* Players */}

              <BookingField
                label="Number of Players"
                type="number"
                required
                value={bookingData.players}
                onChange={(e) =>
                  updateField(
                    "players",
                    Number(
                      e.target.value
                    )
                  )
                }
                onBlur={() =>
                  handleBlur("players")
                }
                error={
                  touched.players
                    ? errors.players
                    : undefined
                }
                success={
                  touched.players &&
                  !errors.players
                }
                className="
                  !border-white/[0.10]
                  !bg-white/[0.035]
                  !text-white
                  placeholder:!text-white/25
                  focus:!border-[#B6F000]/70
                  focus:!ring-[#B6F000]/10
                "
              />

              {/* Mobile */}

              <BookingField
                label="Mobile Number"
                type="tel"
                placeholder="9876543210"
                required
                maxLength={10}
                value={bookingData.mobile}
                onChange={(e) =>
                  updateField(
                    "mobile",
                    e.target.value
                  )
                }
                onBlur={() =>
                  handleBlur("mobile")
                }
                error={
                  touched.mobile
                    ? errors.mobile
                    : undefined
                }
                success={
                  touched.mobile &&
                  !errors.mobile
                }
                className="
                  !border-white/[0.10]
                  !bg-white/[0.035]
                  !text-white
                  placeholder:!text-white/25
                  focus:!border-[#B6F000]/70
                  focus:!ring-[#B6F000]/10
                "
              />
            </div>

            {/* Full Name */}

            <div className="mt-5">
              <BookingField
                label="Full Name"
                placeholder="Enter your full name"
                required
                value={
                  bookingData.fullName
                }
                onChange={(e) =>
                  updateField(
                    "fullName",
                    e.target.value
                  )
                }
                onBlur={() =>
                  handleBlur("fullName")
                }
                error={
                  touched.fullName
                    ? errors.fullName
                    : undefined
                }
                success={
                  touched.fullName &&
                  !errors.fullName
                }
                className="
                  !border-white/[0.10]
                  !bg-white/[0.035]
                  !text-white
                  placeholder:!text-white/25
                  focus:!border-[#B6F000]/70
                  focus:!ring-[#B6F000]/10
                "
              />
            </div>

            {/* Special Request */}

            <div className="mt-5">
              <BookingField
                label="Special Request"
                textarea
                placeholder="Birthday match, corporate event, tournament, coaching..."
                value={
                  bookingData.specialRequest
                }
                onChange={(e) =>
                  updateField(
                    "specialRequest",
                    e.target.value
                  )
                }
                className="
                  !min-h-[110px]
                  !border-white/[0.10]
                  !bg-white/[0.035]
                  !text-white
                  placeholder:!text-white/25
                  focus:!border-[#B6F000]/70
                  focus:!ring-[#B6F000]/10
                "
              />
            </div>
          </section>

          {/* ==================================
              BOOKING HOLD NOTE
          ================================== */}

          <div
            className="
              mt-8
              rounded-[16px]
              border
              border-[#B6F000]/10
              bg-[#B6F000]/[0.035]
              px-4
              py-4
            "
          >
            <div className="flex gap-3">
              <div
                className="
                  mt-0.5
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#B6F000]/10
                "
              >
                <ShieldCheck
                  size={15}
                  className="text-[#B6F000]"
                />
              </div>

              <div>
                <p
                  className="
                    text-xs
                    font-medium
                    text-white/70
                  "
                >
                  Secure booking process
                </p>

                <p
                  className="
                    mt-1
                    text-[11px]
                    leading-5
                    text-white/35
                  "
                >
                  Your slot is temporarily held
                  while payment is completed.
                  The booking becomes confirmed
                  only after successful payment.
                </p>
              </div>
            </div>
          </div>

          {/* ==================================
              CONTINUE BUTTON
          ================================== */}

          <button
            type="button"
            disabled={!isValid}
            onClick={handleContinue}
            className={`
              group
              relative
              mt-5
              h-[58px]
              w-full
              overflow-hidden
              rounded-[15px]
              text-[14px]
              font-semibold
              transition-all
              duration-300

              ${
                isValid
                  ? `
                    bg-[#B6F000]
                    text-black
                    shadow-[0_10px_35px_rgba(182,240,0,0.12)]
                    hover:-translate-y-[1px]
                    hover:shadow-[0_16px_45px_rgba(182,240,0,0.22)]
                    active:translate-y-0
                  `
                  : `
                    cursor-not-allowed
                    bg-white/[0.07]
                    text-white/25
                    border
                    border-white/[0.06]
                  `
              }
            `}
          >
            {isValid && (
              <span
                className="
                  absolute
                  inset-0
                  -translate-x-full
                  bg-white/25
                  transition-transform
                  duration-700
                  group-hover:translate-x-full
                "
              />
            )}

            <span
              className="
                relative
                flex
                items-center
                justify-center
                gap-2
              "
            >
              Continue Booking

              <span
                className="
                  text-lg
                  transition-transform
                  duration-200
                  group-hover:translate-x-1
                "
              >
                →
              </span>
            </span>
          </button>

          {/* ==================================
              Razorpay
          ================================== */}

          <div
            className="
              mt-4
              flex
              items-center
              justify-center
              gap-2
              text-[10px]
              text-white/25
            "
          >
            <ShieldCheck
              size={12}
            />

            <span>
              Secure payment • Powered by Razorpay
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}