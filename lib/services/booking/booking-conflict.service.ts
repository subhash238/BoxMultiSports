import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { Booking } from "@prisma/client";
import { BOOKING_MESSAGES } from "./booking.responses";

import {
  BookingTimeResult,
} from "./booking.types";

import { BOOKING_CONFIG } from "./booking.config";

export class BookingConflictService {
  /**
   * ==========================================
   * Check Booking Conflict
   * ==========================================
   *
   * A slot is considered unavailable when:
   *
   * 1. A CONFIRMED booking overlaps it.
   *
   * OR
   *
   * 2. A PENDING booking overlaps it and is
   *    still inside the payment hold period.
   *
   * CANCELLED bookings never block a slot.
   * ==========================================
   */
  static async check(
    sportId: string,
    bookingTime: BookingTimeResult
  ): Promise<void> {
    const conflictingBooking =
      await this.findConflict(
        sportId,
        bookingTime
      );

    if (
      this.hasOverlap(
        conflictingBooking
      )
    ) {
      throw new AppError(
        BOOKING_MESSAGES.SLOT_ALREADY_BOOKED,
        409
      );
    }
  }

  /**
   * ==========================================
   * Find Conflict
   * ==========================================
   *
   * IMPORTANT:
   *
   * The overlap condition is:
   *
   * existing.startTime < requested.endTime
   *
   * AND
   *
   * existing.endTime > requested.startTime
   *
   * Therefore:
   *
   * Existing: 06:00 → 08:00
   *
   * New:      08:00 → 10:00
   *
   * Result: AVAILABLE ✅
   *
   * But:
   *
   * Existing: 06:00 → 08:00
   *
   * New:      07:00 → 09:00
   *
   * Result: CONFLICT ❌
   * ==========================================
   */
  private static async findConflict(
    sportId: string,
    bookingTime: BookingTimeResult
  ): Promise<Booking | null> {
    /**
     * ==========================================
     * Calculate Active Payment Hold Start
     * ==========================================
     *
     * Any PENDING booking created before this
     * time is considered expired and therefore
     * does not block the requested slot.
     */
    const pendingHoldStartedAt =
      new Date(
        Date.now() -
          BOOKING_CONFIG.PAYMENT_HOLD_MINUTES *
            60 *
            1000
      );

    /**
     * ==========================================
     * Find Overlapping Booking
     * ==========================================
     */
    return prisma.booking.findFirst({
      where: {
        sportId,

        OR: [
          /**
           * --------------------------------------
           * CONFIRMED Booking
           * --------------------------------------
           *
           * CONFIRMED bookings always block
           * overlapping slots.
           */
          {
            status: "CONFIRMED",

            startTime: {
              lt: bookingTime.endDateTime,
            },

            endTime: {
              gt: bookingTime.startDateTime,
            },
          },

          /**
           * --------------------------------------
           * Active PENDING Booking
           * --------------------------------------
           *
           * PENDING bookings only block the slot
           * while the customer has an active
           * payment hold.
           */
          {
            status: "PENDING",

            createdAt: {
              gt: pendingHoldStartedAt,
            },

            startTime: {
              lt: bookingTime.endDateTime,
            },

            endTime: {
              gt: bookingTime.startDateTime,
            },
          },
        ],
      },
    });
  }

  /**
   * ==========================================
   * Has Overlap
   * ==========================================
   */
  private static hasOverlap(
    booking: Booking | null
  ): boolean {
    return booking !== null;
  }
}