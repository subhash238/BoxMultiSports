"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";

import BookingField from "./BookingField";
import SlotAvailabilityModal from "./SlotAvailabilityModal";
import {
  ENABLED_MAIN_BOOKING_DURATIONS,
  HOMEPAGE_BOOKING_SPORTS,
  HomepageBookingSportSlug,
} from "./constants";

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

interface HomepageBookingSport extends Sport {
  displayLabel: string;
}

function isHomepageBookingSportSlug(
  slug: string
): slug is HomepageBookingSportSlug {
  return HOMEPAGE_BOOKING_SPORTS.some(
    (sport) => sport.slug === slug
  );
}

// ==========================================
// Props
// ==========================================

interface BookingFormProps {
  bookingData: BookingData;

  selectedSportSlug?: string | null;

  setBookingData: React.Dispatch<
    React.SetStateAction<BookingData>
  >;

  onBookingCreated: (
    result: {
      booking: CreatedBooking;
      guestPaymentToken: string | null;
    }
  ) => void;

  onBookingError: (
    message: string
  ) => void;

  setBookingLoading: (
    loading: boolean
  ) => void;
}

const MAIN_OPENING_MINUTES = 5 * 60;
const MAIN_CLOSING_MINUTES = 24 * 60;
const MAIN_START_TIME_INTERVAL_MINUTES = 30;

export type MainStartTimeOption = {
  value: string;
  label: string;
};

function formatTimeValue(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}`;
}

function formatTimeLabel(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours < 12 ? "AM" : "PM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(
    2,
    "0"
  )} ${period}`;
}

export function generateMainStartTimeOptions(
  durationMinutes?: number
): MainStartTimeOption[] {
  if (
    typeof durationMinutes !== "number" ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes <= 0
  ) {
    return [];
  }

  const options: MainStartTimeOption[] = [];

  for (
    let startMinutes = MAIN_OPENING_MINUTES;
    startMinutes < MAIN_CLOSING_MINUTES;
    startMinutes += MAIN_START_TIME_INTERVAL_MINUTES
  ) {
    if (
      startMinutes + durationMinutes >
      MAIN_CLOSING_MINUTES
    ) {
      continue;
    }

    options.push({
      value: formatTimeValue(startMinutes),
      label: formatTimeLabel(startMinutes),
    });
  }

  return options;
}

// ==========================================
// Add Duration To Time
// ==========================================

export function addDurationToTime(
  startTime: string,
  durationMinutes?: number
): string {
  const [hoursString, minutesString] =
    startTime.split(":");

  const hours = Number(hoursString);
  const minutes = Number(minutesString);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    typeof durationMinutes !== "number" ||
    !Number.isFinite(durationMinutes) ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes <= 0
  ) {
    throw new Error(
      "Invalid booking time or duration."
    );
  }

  const totalMinutes =
    hours * 60 +
    minutes +
    durationMinutes;

  if (totalMinutes > 24 * 60) {
    throw new Error(
      "Booking cannot extend beyond midnight."
    );
  }

  const endHours = Math.floor(
    totalMinutes / 60
  ) % 24;

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
  selectedSportSlug = null,
  setBookingData,
  onBookingCreated,
  onBookingError,
  setBookingLoading,
}: BookingFormProps) {
  // ==========================================
  // Sports
  // ==========================================

  const [sports, setSports] =
    useState<HomepageBookingSport[]>([]);

  const [sportsLoading, setSportsLoading] =
    useState(true);

  const searchParams =
    useSearchParams();

  const requestedSportSlug =
    searchParams.get("sport");

  const hasAppliedSportPreselection =
    useRef(false);

  const bookingDateInputRef =
    useRef<HTMLInputElement>(null);

  const [sportsError, setSportsError] =
    useState("");

  const [
    isSlotModalOpen,
    setIsSlotModalOpen,
  ] = useState(false);

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
      // Keep native focus/click behavior as the fallback.
    }
  };

  const startTimeOptions = useMemo(
    () =>
      generateMainStartTimeOptions(
        bookingData.durationMinutes
      ),
    [bookingData.durationMinutes]
  );

  const selectedSportForAvailability =
    useMemo(
      () =>
        sports.find(
          (sport) =>
            sport.id === bookingData.sport
        ) ?? null,
      [
        sports,
        bookingData.sport,
      ]
    );

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
  const handleOpenSlotAvailability = () => {
    let canOpen = true;

    if (!bookingData.sport || errors.sport) {
      handleBlur("sport");
      canOpen = false;
    }

    if (!bookingData.date || errors.date) {
      handleBlur("date");
      canOpen = false;
    }

    if (
      typeof bookingData.durationMinutes !== "number" ||
      errors.duration
    ) {
      handleBlur("duration");
      canOpen = false;
    }

    if (!canOpen) {
      return;
    }

    setIsSlotModalOpen(true);
  };


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

        const fetchedSports: Sport[] =
          result.sports ?? [];

        const sharedSports =
          HOMEPAGE_BOOKING_SPORTS.flatMap(
            ({ slug, label }) => {
              const sport = fetchedSports.find(
                (item) => item.slug === slug
              );

              return sport
                ? [
                    {
                      ...sport,
                      displayLabel: label,
                    },
                  ]
                : [];
            }
          );

        setSports(sharedSports);
      } catch (error) {
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

  useEffect(() => {
    if (sportsLoading) {
      return;
    }

    const requestedSlug =
      selectedSportSlug ?? requestedSportSlug;

    if (!selectedSportSlug) {
      if (hasAppliedSportPreselection.current) {
        return;
      }

      hasAppliedSportPreselection.current = true;
    }

    if (
      !requestedSlug ||
      !isHomepageBookingSportSlug(
        requestedSlug
      )
    ) {
      return;
    }

    const matchedSport =
      sports.find(
        (sport) =>
          sport.slug === requestedSlug
      );

    if (!matchedSport) {
      return;
    }

    setBookingData((current) => ({
      ...current,
      sport: matchedSport.id,
    }));
  }, [
    requestedSportSlug,
    selectedSportSlug,
    setBookingData,
    sports,
    sportsLoading,
  ]);

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
      // Read Start Time
      // ---------------------------------------

      const startTime = bookingData.time;

      const durationMinutes =
        bookingData.durationMinutes;

      if (
        typeof durationMinutes !== "number" ||
        !Number.isInteger(durationMinutes) ||
        durationMinutes <= 0
      ) {
        throw new Error(
          "Invalid booking duration."
        );
      }

      // ---------------------------------------
      // Calculate End Time
      // ---------------------------------------

      const endTime =
        addDurationToTime(
          startTime,
          durationMinutes
        );

      const trimmedSpecialRequest =
        bookingData.specialRequest.trim();

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

            durationMinutes,

            numberOfPlayers: 1,

            fullName:
              bookingData.fullName.trim(),

            email:
              (bookingData.email ?? "").trim(),

            mobile:
              bookingData.mobile.replace(/\D/g, ""),

            ...(trimmedSpecialRequest
              ? {
                  specialRequest:
                    trimmedSpecialRequest,
                }
              : {}),
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

      if (!result.data?.booking?.id) {
        throw new Error(
          "Booking was created but booking information was not returned."
        );
      }

      // ---------------------------------------
      // Prepare Booking
      // ---------------------------------------

      const booking =
        result.data.booking;

      const selectedSport =
        sports.find(
          (sport) =>
            sport.id === bookingData.sport
        );

      const createdBooking:
        CreatedBooking = {
        id: booking.id,

        bookingNumber:
          booking.bookingNumber,

        sportName:
          selectedSport?.displayLabel,

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

      const guestPaymentToken =
        typeof result.data.guestPaymentToken ===
        "string"
          ? result.data.guestPaymentToken
          : null;

      // ---------------------------------------
      // Open Payment Modal
      // ---------------------------------------

      onBookingCreated(
        {
          booking: createdBooking,
          guestPaymentToken,
        }
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create booking.";

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
                  Game
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
                          {sport.displayLabel}
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
                inputId="booking-date"
                inputRef={bookingDateInputRef}
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
                onInputClick={handleBookingDateClick}
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
                  cursor-pointer
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
                  Start Time
                  <span className="ml-1 text-[#B6F000]">
                    *
                  </span>
                </label>

                <button
                  type="button"
                  onClick={handleOpenSlotAvailability}
                  className={`
                    ${
                      touched.time &&
                      errors.time
                        ? selectError
                        : bookingData.time
                          ? selectSuccess
                          : selectNormal
                    }
                    flex
                    items-center
                    justify-between
                    gap-3
                    text-left
                  `}
                >
                  <span>
                    {bookingData.time
                      ? `${
                          startTimeOptions.find(
                            (option) =>
                              option.value ===
                              bookingData.time
                          )?.label ??
                          bookingData.time
                        } ✓`
                      : "Select a slot"}
                  </span>

                  <span
                    className="
                      shrink-0
                      text-[11px]
                      font-semibold
                      text-[#B6F000]
                    "
                  >
                    {bookingData.time
                      ? "Change Slot"
                      : "Check Availability"}
                  </span>
                </button>

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
                    onChange={(e) => {
                      const selectedDuration =
                        ENABLED_MAIN_BOOKING_DURATIONS.find(
                          (duration) =>
                            duration.label ===
                            e.target.value
                        );

                      const nextDurationMinutes =
                        selectedDuration?.minutes;
                      const nextStartTimeOptions =
                        generateMainStartTimeOptions(
                          nextDurationMinutes
                        );
                      setBookingData((current) => {
                        const selectedTimeRemainsValid =
                          nextStartTimeOptions.some(
                            (option) =>
                              option.value === current.time
                          );

                        return {
                          ...current,
                          duration:
                            selectedDuration?.label ?? "",
                          durationMinutes:
                            nextDurationMinutes,
                          time: selectedTimeRemainsValid
                            ? current.time
                            : "",
                        };
                      });
                    }}
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

                    {ENABLED_MAIN_BOOKING_DURATIONS.map(
                      (duration) => (
                        <option
                          key={duration.minutes}
                          value={duration.label}
                        >
                          {duration.label}
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
              "
            >
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

            {/* Email */}

            <div className="mt-5">
              <BookingField
                label="Email ID"
                type="email"
                placeholder="you@example.com"
                required
                maxLength={255}
                value={bookingData.email ?? ""}
                onChange={(e) =>
                  updateField(
                    "email",
                    e.target.value
                  )
                }
                onBlur={() =>
                  handleBlur("email")
                }
                error={
                  touched.email
                    ? errors.email
                    : undefined
                }
                success={
                  touched.email &&
                  !errors.email
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
                onBlur={() =>
                  handleBlur("specialRequest")
                }
                error={
                  touched.specialRequest
                    ? errors.specialRequest
                    : undefined
                }
                success={
                  touched.specialRequest &&
                  !!bookingData.specialRequest.trim() &&
                  !errors.specialRequest
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
                    cursor-pointer
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
              Proceed to Payment

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

      {isSlotModalOpen &&
        selectedSportForAvailability &&
        bookingData.date &&
        typeof bookingData.durationMinutes === "number" && (
          <SlotAvailabilityModal
            sportId={bookingData.sport}
            sportName={
              selectedSportForAvailability.displayLabel
            }
            bookingDate={bookingData.date}
            durationMinutes={
              bookingData.durationMinutes
            }
            selectedTime={bookingData.time}
            onSelect={(startTime) => {
              updateField(
                "time",
                startTime
              );
              setIsSlotModalOpen(false);
            }}
            onClose={() =>
              setIsSlotModalOpen(false)
            }
          />
        )}
    </div>
  );
}
