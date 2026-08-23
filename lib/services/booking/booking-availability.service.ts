import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { BOOKING_MESSAGES } from "./booking.responses";
import {
  BOOKING_CONFIG,
  MAIN_BOOKING_SPORT_SLUGS,
} from "./booking.config";
import {
  MainBookingAvailabilityInput,
  MainBookingAvailabilityResult,
  MainBookingAvailabilitySlot,
} from "./booking.types";
import {
  buildBookingTimeFromDuration,
  buildDateOnly,
  buildIstDateTimeForBookingDate,
  normalizeDate,
} from "./booking.utils";

const MAIN_START_TIME_INTERVAL_MINUTES = 30;

function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function generateCandidateSlots(
  durationMinutes: number
): MainBookingAvailabilitySlot[] {
  const slots: MainBookingAvailabilitySlot[] = [];

  for (
    let startMinutes =
      BOOKING_CONFIG.MAIN_OPENING_MINUTES_FROM_MIDNIGHT;
    startMinutes <
    BOOKING_CONFIG.MAIN_CLOSING_MINUTES_FROM_MIDNIGHT;
    startMinutes += MAIN_START_TIME_INTERVAL_MINUTES
  ) {
    const endMinutes =
      startMinutes + durationMinutes;

    if (
      endMinutes >
      BOOKING_CONFIG.MAIN_CLOSING_MINUTES_FROM_MIDNIGHT
    ) {
      continue;
    }

    slots.push({
      startTime: formatTime(startMinutes),
      endTime: formatTime(endMinutes),
      available: true,
    });
  }

  return slots;
}

export class BookingAvailabilityService {
  static async getMainSportAvailability(
    input: MainBookingAvailabilityInput
  ): Promise<MainBookingAvailabilityResult> {
    if (
      !Number.isInteger(input.durationMinutes) ||
      input.durationMinutes <= 0 ||
      input.durationMinutes > 720
    ) {
      throw new AppError(
        "Booking duration must be a whole number of minutes between 1 and 720.",
        400
      );
    }

    const bookingDate = buildDateOnly(
      input.bookingDate
    );

    if (Number.isNaN(bookingDate.getTime())) {
      throw new AppError(
        "Booking date must be a valid date in YYYY-MM-DD format.",
        400
      );
    }

    if (
      bookingDate <
      normalizeDate(new Date())
    ) {
      throw new AppError(
        BOOKING_MESSAGES.PAST_DATE,
        400
      );
    }

    const sport = await prisma.sport.findUnique({
      where: {
        id: input.sportId,
      },
      select: {
        id: true,
        slug: true,
        isActive: true,
      },
    });

    if (!sport) {
      throw new AppError(
        BOOKING_MESSAGES.SPORT_NOT_FOUND,
        404
      );
    }

    if (!sport.isActive) {
      throw new AppError(
        BOOKING_MESSAGES.SPORT_INACTIVE,
        400
      );
    }

    if (!MAIN_BOOKING_SPORT_SLUGS.has(sport.slug)) {
      throw new AppError(
        "Availability is currently supported only for main sports.",
        400
      );
    }

    const pricing =
      await prisma.sportPricing.findFirst({
        where: {
          sportId: input.sportId,
          duration: input.durationMinutes,
          isActive: true,
        },
        select: {
          id: true,
         },
      });

    if (!pricing) {
      throw new AppError(
        `No active pricing is configured for a ${input.durationMinutes}-minute booking.`,
        400
      );
    }

    const now = new Date();
    const legacyCutoff = new Date(
      now.getTime() -
        BOOKING_CONFIG.PAYMENT_HOLD_MINUTES *
          60 *
          1000
    );

    const openingBoundary =
      buildIstDateTimeForBookingDate(
        bookingDate,
        BOOKING_CONFIG.MAIN_OPENING_MINUTES_FROM_MIDNIGHT
      );

    const closingBoundary =
      buildIstDateTimeForBookingDate(
        bookingDate,
        BOOKING_CONFIG.MAIN_CLOSING_MINUTES_FROM_MIDNIGHT
      );

    const blockingBookings =
      await prisma.booking.findMany({
        where: {
          sportId: input.sportId,
          startTime: {
            lt: closingBoundary,
          },
          endTime: {
            gt: openingBoundary,
          },
          OR: [
            {
              status: "CONFIRMED",
            },
            {
              status: "PENDING",
              OR: [
                {
                  reservationExpiresAt: {
                    gt: now,
                  },
                },
                {
                  reservationExpiresAt: null,
                  createdAt: {
                    gt: legacyCutoff,
                  },
                },
              ],
            },
          ],
        },
        select: {
          startTime: true,
          endTime: true,
        },
      });

    const slots = generateCandidateSlots(
      input.durationMinutes
    ).map((slot) => {
      const candidateTime =
        buildBookingTimeFromDuration(
          input.bookingDate,
          slot.startTime,
          input.durationMinutes
        );

      const isBlocked =
        blockingBookings.some(
          (booking) =>
            booking.startTime <
              candidateTime.endDateTime &&
            booking.endTime >
              candidateTime.startDateTime
        );

      const isPastTime =
        candidateTime.startDateTime <= now;

      return {
        ...slot,
        available: !isPastTime && !isBlocked,
      };
    });

    return {
      sportId: input.sportId,
      bookingDate: input.bookingDate,
      durationMinutes: input.durationMinutes,
      slots,
    };
  }
}
