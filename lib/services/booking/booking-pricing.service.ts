import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

import {
  BookingPricingResult,
  BookingTimeResult,
} from "./booking.types";

import {
  calculateDurationMinutes,
} from "./booking.utils";

export class BookingPricingService {
  /**
   * ==========================================
   * Calculate Booking Pricing
   * ==========================================
   *
   * Pricing is based on:
   *
   * SPORT + DURATION
   *
   * Current pricing:
   *
   * 1 Hour  → ₹1000
   * 2 Hours → ₹1800
   * 3 Hours → ₹2700
   * 4 Hours → ₹3500
   * 5 Hours → ₹4500
   * 12 Hours → ₹9000
   *
   * Players do NOT affect pricing.
   * ==========================================
   */
  static async calculate(
    sportId: string,
    bookingTime: BookingTimeResult
  ): Promise<BookingPricingResult> {
    // -----------------------------------------
    // Calculate Duration
    // -----------------------------------------

    const durationMinutes =
      this.calculateDuration(bookingTime);

    const durationHours =
      durationMinutes / 60;

    // -----------------------------------------
    // Validate Duration
    // -----------------------------------------
    //
    // SportPricing.duration is stored
    // in complete hours.
    //
    // Examples:
    //
    // 60 minutes  → 1 hour  ✅
    // 120 minutes → 2 hours ✅
    // 180 minutes → 3 hours ✅
    // 240 minutes → 4 hours ✅
    // 300 minutes → 5 hours ✅
    // 720 minutes → 12 hours ✅
    //
    // 90 minutes → invalid ❌
    // -----------------------------------------

    if (
      durationMinutes <= 0 ||
      !Number.isInteger(durationHours)
    ) {
      throw new AppError(
        "Booking duration must be a complete number of hours.",
        400
      );
    }

    // -----------------------------------------
    // Find Active Sport Pricing
    // -----------------------------------------
    //
    // Pricing is determined by:
    //
    // sportId + duration
    //
    // The actual price comes from the
    // SportPricing table.
    //
    // Example:
    //
    // Cricket + 1 hour  → ₹1000
    // Cricket + 2 hours → ₹1800
    // Cricket + 3 hours → ₹2700
    // Cricket + 4 hours → ₹3500
    // Cricket + 5 hours → ₹4500
    // Cricket + 12 hours → ₹9000
    // -----------------------------------------

    const sportPricing =
      await prisma.sportPricing.findFirst({
        where: {
          sportId,
          duration: durationHours,
          isActive: true,
        },
      });

    // -----------------------------------------
    // Pricing Not Found
    // -----------------------------------------

    if (!sportPricing) {
      throw new AppError(
        `No active pricing is configured for a ${durationHours}-hour booking.`,
        400
      );
    }

    // -----------------------------------------
    // Convert Prisma Decimal
    // -----------------------------------------

    const price =
      Number(sportPricing.price);

    // -----------------------------------------
    // Return Pricing Result
    // -----------------------------------------
    //
    // totalAmount is the FIXED price configured
    // for this sport + duration.
    //
    // Players do NOT affect this amount.
    //
    // pricePerHour is retained temporarily
    // for compatibility with the existing
    // BookingPricingResult type.
    // -----------------------------------------

    return {
      durationMinutes,

      durationHours,

      pricePerHour:
        price / durationHours,

      totalAmount:
        price,
    };
  }

  /**
   * ==========================================
   * Calculate Duration
   * ==========================================
   */
  private static calculateDuration(
    bookingTime: BookingTimeResult
  ): number {
    return calculateDurationMinutes(
      bookingTime.startDateTime,
      bookingTime.endDateTime
    );
  }
}