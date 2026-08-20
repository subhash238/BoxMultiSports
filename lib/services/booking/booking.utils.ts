import { BookingTimeResult } from "./booking.types";

/**
 * ==========================================
 * Application Timezone
 * ==========================================
 *
 * Box MultiSports operates in India.
 *
 * All customer booking times are interpreted
 * as Indian Standard Time (IST).
 *
 * IST = UTC + 05:30
 * ==========================================
 */

const INDIA_TIMEZONE_OFFSET = "+05:30";

/**
 * ==========================================
 * Build Booking Date & Time
 * ==========================================
 *
 * Customer sends:
 *
 * bookingDate = "2026-08-16"
 * startTime   = "06:00"
 * endTime     = "08:00"
 *
 * These values are treated as IST,
 * regardless of the server's timezone.
 * ==========================================
 */
export function buildBookingTime(
  bookingDate: string,
  startTime: string,
  endTime: string
): BookingTimeResult {
  return {
    bookingDate: new Date(
      `${bookingDate}T00:00:00${INDIA_TIMEZONE_OFFSET}`
    ),

    startDateTime: new Date(
      `${bookingDate}T${startTime}:00${INDIA_TIMEZONE_OFFSET}`
    ),

    endDateTime: new Date(
      `${bookingDate}T${endTime}:00${INDIA_TIMEZONE_OFFSET}`
    ),
  };
}

export function buildBookingTimeFromDuration(
  bookingDate: string,
  startTime: string,
  durationMinutes: number
): BookingTimeResult {
  const bookingDateValue = new Date(
    `${bookingDate}T00:00:00${INDIA_TIMEZONE_OFFSET}`
  );

  const startDateTime = new Date(
    `${bookingDate}T${startTime}:00${INDIA_TIMEZONE_OFFSET}`
  );

  const endDateTime = new Date(
    startDateTime.getTime() +
      durationMinutes * 60 * 1000
  );

  return {
    bookingDate: bookingDateValue,
    startDateTime,
    endDateTime,
  };
}

/**
 * ==========================================
 * Calculate Duration
 * ==========================================
 */
export function calculateDurationMinutes(
  start: Date,
  end: Date
): number {
  return (
    (end.getTime() - end.getTime() +
      (end.getTime() - start.getTime())) /
    (1000 * 60)
  );
}

/**
 * ==========================================
 * Check Same Date
 * ==========================================
 */
export function isSameDay(
  first: Date,
  second: Date
): boolean {
  return (
    first.toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    }) ===
    second.toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    })
  );
}

/**
 * ==========================================
 * Normalize Date
 * ==========================================
 *
 * Normalizes the date according to India
 * timezone instead of the server timezone.
 * ==========================================
 */
export function normalizeDate(
  date: Date
): Date {
  const indiaDate = date.toLocaleDateString(
    "en-CA",
    {
      timeZone: "Asia/Kolkata",
    }
  );

  return new Date(
    `${indiaDate}T00:00:00${INDIA_TIMEZONE_OFFSET}`
  );
}

/**
 * ==========================================
 * Format Date
 * YYYYMMDD
 * ==========================================
 */
export function formatBookingDate(
  date: Date
): string {
  return date.toLocaleDateString(
    "en-CA",
    {
      timeZone: "Asia/Kolkata",
    }
  ).replace(/-/g, "");
}
