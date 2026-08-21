import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

import {
  BookingPricingResult,
  BookingTimeResult,
} from "./booking.types";

import {
  calculateDurationMinutes,
} from "./booking.utils";
import {
  MAIN_BOOKING_SPORT_SLUGS,
  YOGA_ALLOWED_DURATIONS_MINUTES,
} from "./booking.config";

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
    bookingTime: BookingTimeResult,
    sportSlug?: string,
    numberOfPlayers?: number
  ): Promise<BookingPricingResult> {
    // -----------------------------------------
    // Calculate Duration
    // -----------------------------------------

    const durationMinutes =
      this.calculateDuration(bookingTime);

    const durationHours =
      durationMinutes / 60;

    const isMainBookingSport =
      sportSlug !== undefined &&
      MAIN_BOOKING_SPORT_SLUGS.has(
        sportSlug
      );

    const isYoga =
      sportSlug === "yoga";

    const isGym =
      sportSlug === "gym";

    // -----------------------------------------
    // Validate Duration
    // -----------------------------------------
    //
    // Main, Yoga, and Gym SportPricing durations
    // use exact minutes. Other existing booking
    // flows retain their complete-hour requirement.
    // -----------------------------------------

    if (
      durationMinutes <= 0 ||
      (!isMainBookingSport &&
        !isYoga &&
        !isGym &&
        !Number.isInteger(durationHours))
    ) {
      throw new AppError(
        "Booking duration must be a complete number of hours.",
        400
      );
    }

    if (
      isYoga ||
      isGym
    ) {
      if (
        numberOfPlayers === undefined ||
        !Number.isInteger(numberOfPlayers) ||
        numberOfPlayers < 1
      ) {
        throw new AppError(
          "Number of players must be a positive integer.",
          400
        );
      }
    }

    if (isYoga) {
      if (
        !YOGA_ALLOWED_DURATIONS_MINUTES.has(
          durationMinutes
        )
      ) {
        throw new AppError(
          "Yoga bookings support only 60, 90, or 120 minutes.",
          400
        );
      }

      const sportPricing =
        await prisma.sportPricing.findFirst({
          where: {
            sportId,
            duration: durationMinutes,
            isActive: true,
          },
        });

      if (!sportPricing) {
        throw new AppError(
          `No active pricing is configured for a ${durationMinutes}-minute Yoga booking.`,
          400
        );
      }

      const totalAmount = Number(
        sportPricing.price.mul(
          numberOfPlayers!
        )
      );

      return {
        durationMinutes,
        durationHours,
        pricePerHour:
          totalAmount / durationHours,
        totalAmount,
      };
    }

    if (isGym) {
      const sportPricing =
        await prisma.sportPricing.findFirst({
          where: {
            sportId,
            duration: durationMinutes,
            isActive: true,
          },
        });

      if (!sportPricing) {
        throw new AppError(
          `No active pricing is configured for a ${durationMinutes}-minute Gym booking.`,
          400
        );
      }

      const totalAmount = Number(
        sportPricing.price.mul(
          numberOfPlayers!
        )
      );

      return {
        durationMinutes,
        durationHours,
        pricePerHour:
          totalAmount / durationHours,
        totalAmount,
      };
    }

    // -----------------------------------------
    // Find Active Sport Pricing
    // -----------------------------------------
    //
    // Main pricing is determined by:
    //
    // sportId + exact duration in minutes
    //
    // The actual price comes from the
    // SportPricing table.
    //
    // Example:
    //
    // Cricket + 60 minutes
    // Cricket + 90 minutes
    // Cricket + 720 minutes
    //
    // Other existing sports retain their
    // legacy complete-hour lookup.
    // -----------------------------------------

    const pricingDuration =
      isMainBookingSport
        ? durationMinutes
        : durationHours;

    const sportPricing =
      await prisma.sportPricing.findFirst({
        where: {
          sportId,
          duration: pricingDuration,
          isActive: true,
        },
      });

    // -----------------------------------------
    // Pricing Not Found
    // -----------------------------------------

    if (!sportPricing) {
      const durationDescription =
        isMainBookingSport
          ? `${durationMinutes}-minute`
          : `${durationHours}-hour`;

      throw new AppError(
        `No active pricing is configured for a ${durationDescription} booking.`,
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
