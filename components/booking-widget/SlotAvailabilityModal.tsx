"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

type AvailabilitySlot = {
  startTime: string;
  endTime: string;
  available: boolean;
};

type AvailabilityResponse = {
  success: boolean;
  data?: {
    sportId: string;
    bookingDate: string;
    durationMinutes: number;
    slots: AvailabilitySlot[];
  };
  message?: string;
};

interface SlotAvailabilityModalProps {
  sportId: string;
  sportName: string;
  bookingDate: string;
  durationMinutes: number;
  selectedTime: string;
  onSelect: (startTime: string) => void;
  onClose: () => void;
}

function formatTime(time: string): string {
  const [hoursString, minutesString] =
    time.split(":");

  const hours = Number(hoursString);
  const minutes = Number(minutesString);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return time;
  }

  if (hours === 24) {
    return "12:00 AM";
  }

  const period =
    hours >= 12 ? "PM" : "AM";

  const displayHours =
    hours % 12 || 12;

  return `${displayHours}:${String(
    minutes
  ).padStart(2, "0")} ${period}`;
}

function formatDate(
  bookingDate: string
): string {
  const date = new Date(
    `${bookingDate}T00:00:00`
  );

  if (
    Number.isNaN(date.getTime())
  ) {
    return bookingDate;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

export default function SlotAvailabilityModal({
  sportId,
  sportName,
  bookingDate,
  durationMinutes,
  selectedTime,
  onSelect,
  onClose,
}: SlotAvailabilityModalProps) {
  const [
    slots,
    setSlots,
  ] = useState<AvailabilitySlot[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const loadAvailability =
    useCallback(
      async (
        signal?: AbortSignal
      ) => {
        try {
          setLoading(true);
          setError(null);

          const searchParams =
            new URLSearchParams({
              sportId,
              bookingDate,
              durationMinutes:
                String(durationMinutes),
            });

          const response =
            await fetch(
              `/api/booking/availability?${searchParams.toString()}`,
              {
                method: "GET",
                cache: "no-store",
                signal,
              }
            );

          const result =
            (await response.json()) as AvailabilityResponse;

          if (
            !response.ok ||
            !result.success ||
            !result.data
          ) {
            throw new Error(
              result.message ||
                "Unable to load available slots."
            );
          }

          setSlots(
            result.data.slots
          );
        } catch (error) {
          if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            return;
          }

          setSlots([]);

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load available slots."
          );
        } finally {
          if (!signal?.aborted) {
            setLoading(false);
          }
        }
      },
      [
        sportId,
        bookingDate,
        durationMinutes,
      ]
    );

  useEffect(() => {
    const controller =
      new AbortController();

    loadAvailability(
      controller.signal
    );

    return () => {
      controller.abort();
    };
  }, [loadAvailability]);

  const availableCount =
    slots.filter(
      (slot) => slot.available
    ).length;

  return (
    <div
      className="
        fixed inset-0 z-[110]
        flex items-end justify-center
        bg-black/80
        backdrop-blur-md
        md:items-center
        md:px-4 md:py-6
      "
      role="dialog"
      aria-modal="true"
      aria-label="Select available booking slot"
    >
      <div
        className="
          relative
          max-h-[88vh]
          w-full
          overflow-y-auto
          rounded-t-3xl
          border border-white/10
          bg-[#111111]
          p-5
          shadow-2xl
          md:max-w-2xl
          md:rounded-3xl
          md:p-7
        "
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close slot selector"
          className="
            absolute
            right-5 top-5
            flex h-9 w-9
            items-center justify-center
            rounded-full
            bg-white/10
            text-sm font-bold
            text-gray-300
            transition
            hover:bg-white/20
            hover:text-white
          "
        >
          X
        </button>

        <div className="pr-12">
          <span
            className="
              text-xs font-semibold
              uppercase
              tracking-[0.22em]
              text-[#B6F000]
            "
          >
            Live Availability
          </span>

          <h2
            className="
              mt-2
              text-2xl font-black
              text-white
              md:text-3xl
            "
          >
            Choose Your Slot
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-white/45
            "
          >
            Select one available start
            time to continue your booking.
          </p>
        </div>

        <div
          className="
            mt-6
            grid grid-cols-3
            gap-2
            rounded-2xl
            border border-white/10
            bg-white/[0.04]
            p-4
            text-center
          "
        >
          <div>
            <p className="text-xs text-white/40">
              Sport
            </p>

            <p
              className="
                mt-1 truncate
                text-sm font-semibold
                text-white
              "
            >
              {sportName}
            </p>
          </div>

          <div>
            <p className="text-xs text-white/40">
              Date
            </p>

            <p
              className="
                mt-1
                text-sm font-semibold
                text-white
              "
            >
              {formatDate(
                bookingDate
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-white/40">
              Duration
            </p>

            <p
              className="
                mt-1
                text-sm font-semibold
                text-white
              "
            >
              {durationMinutes} min
            </p>
          </div>
        </div>

        <div
          className="
            mt-5
            flex flex-wrap
            items-center gap-4
            text-xs
            text-white/50
          "
        >
          <span className="flex items-center gap-2">
            <span
              className="
                h-3 w-3
                rounded-full
                bg-emerald-300
              "
            />
            Available
          </span>

          <span className="flex items-center gap-2">
            <span
              className="
                h-3 w-3
                rounded-full
                bg-white/20
              "
            />
            Booked
          </span>

          <span className="flex items-center gap-2">
            <span
              className="
                h-3 w-3
                rounded-full
                bg-orange-500
              "
            />
            Selected
          </span>
        </div>

        {loading ? (
          <div
            className="
              flex min-h-56
              items-center justify-center
            "
          >
            <div className="text-center">
              <div
                className="
                  mx-auto
                  h-8 w-8
                  animate-spin
                  rounded-full
                  border-2
                  border-white/15
                  border-t-[#B6F000]
                "
              />

              <p
                className="
                  mt-4
                  text-sm
                  text-white/45
                "
              >
                Checking live
                availability...
              </p>
            </div>
          </div>
        ) : error ? (
          <div
            className="
              mt-6
              rounded-2xl
              border border-red-400/20
              bg-red-400/10
              p-5
              text-center
            "
          >
            <p className="text-sm text-red-300">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                loadAvailability()
              }
              className="
                mt-4
                rounded-xl
                bg-white/10
                px-4 py-2
                text-sm font-semibold
                text-white
                transition
                hover:bg-white/15
              "
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div
              className="
                mt-6
                flex items-center
                justify-between gap-4
              "
            >
              <p
                className="
                  text-sm font-semibold
                  text-white
                "
              >
                Available Start Times
              </p>

              <span
                className="
                  rounded-full
                  bg-[#B6F000]/10
                  px-3 py-1
                  text-xs font-semibold
                  text-[#B6F000]
                "
              >
                {availableCount} available
              </span>
            </div>

            <div
              className="
                mt-4
                grid grid-cols-3
                gap-2
                sm:grid-cols-4
                md:grid-cols-5
              "
            >
              {slots.map(
                (slot) => {
                  const isSelected =
                    slot.available &&
                    slot.startTime ===
                      selectedTime;

                  return (
                    <button
                      key={
                        slot.startTime
                      }
                      type="button"
                      disabled={
                        !slot.available
                      }
                      onClick={() =>
                        onSelect(
                          slot.startTime
                        )
                      }
                      className={`
                        min-h-12
                        rounded-xl
                        border
                        px-2 py-3
                        text-sm font-bold
                        transition
                        ${
                          isSelected
                            ? `
                              border-orange-400
                              bg-orange-500
                              text-white
                              shadow-lg
                            `
                            : slot.available
                              ? `
                                border-emerald-300/30
                                bg-emerald-300/10
                                text-emerald-200
                                hover:border-emerald-300/60
                                hover:bg-emerald-300/20
                              `
                              : `
                                cursor-not-allowed
                                border-white/5
                                bg-white/[0.04]
                                text-white/25
                              `
                        }
                      `}
                    >
                      {formatTime(
                        slot.startTime
                      )}
                    </button>
                  );
                }
              )}
            </div>

            {slots.length === 0 && (
              <div
                className="
                  mt-6
                  rounded-2xl
                  border border-white/10
                  bg-white/[0.04]
                  p-6
                  text-center
                  text-sm
                  text-white/45
                "
              >
                No booking slots are
                available for this
                selection.
              </div>
            )}

            <p
              className="
                mt-5
                text-center
                text-xs
                leading-5
                text-white/35
              "
            >
              Availability is refreshed
              when this selector opens.
              Final availability is
              confirmed when your booking
              is submitted.
            </p>
          </>
        )}
      </div>
    </div>
  );
}