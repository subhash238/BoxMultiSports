import {
  Booking,
  BookingStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

import { CreateBookingInput } from "@/lib/validators/booking";

import {
  BookingListQuery,
  CreateBookingContext,
} from "./booking.types";

import { BOOKING_MESSAGES } from "./booking.responses";

import { BookingValidationService } from "./booking-validation.service";
import { BookingConflictService } from "./booking-conflict.service";
import { BookingPricingService } from "./booking-pricing.service";
import { BookingTransactionService } from "./booking-transaction.service";
import { BookingQueryService } from "./booking-query.service";
import { BookingCancellationService } from "./booking-cancellation.service";

export class BookingService {
  /**
   * ==========================================
   * Create Booking
   * ==========================================
   */
  static async createBooking(
    userId: string,
    data: CreateBookingInput
  ): Promise<Booking> {
    // -----------------------------------------
    // Validate Booking
    // -----------------------------------------

    const {
      sport,
      bookingTime,
      numberOfPlayers,
    } =
      await BookingValidationService.validate(
        data
      );

    // -----------------------------------------
    // Check Booking Conflict
    // -----------------------------------------

    await BookingConflictService.check(
      data.sportId,
      bookingTime
    );

    // -----------------------------------------
    // Calculate Pricing
    // -----------------------------------------

    const pricing =
      await BookingPricingService.calculate(
        data.sportId,
        bookingTime,
        sport.slug,
        numberOfPlayers
      );

    // -----------------------------------------
    // Build Booking Context
    // -----------------------------------------

    const context: CreateBookingContext = {
      userId,
      sport,
      bookingTime,
      pricing,
      numberOfPlayers,
      customerName: data.fullName,
      customerMobile: data.mobile,
    };

    // -----------------------------------------
    // Create Booking Transaction
    // -----------------------------------------

    return BookingTransactionService.create(
      context
    );
  }

  /**
   * ==========================================
   * Get Booking By ID
   * ==========================================
   */
  static async getBookingById(
    userId: string,
    bookingId: string
  ) {
    return this.findBookingOrThrow(
      userId,
      bookingId
    );
  }

  /**
   * ==========================================
   * Get My Bookings
   * ==========================================
   */
  static async getMyBookings(
    userId: string,
    query: BookingListQuery
  ) {
    return BookingQueryService.getUserBookings(
      userId,
      query
    );
  }

  /**
   * ==========================================
   * Get All Bookings - Admin
   * ==========================================
   */
  static async getAdminBookings(
    query: BookingListQuery
  ) {
    return BookingQueryService.getAdminBookings(
      query
    );
  }

  /**
   * ==========================================
   * Cancel Booking
   * ==========================================
   */
  static async cancelBooking(
    userId: string,
    bookingId: string
  ) {
    console.log(
      "1. Before findBooking"
    );

    const booking =
      await this.findBookingOrThrow(
        userId,
        bookingId
      );

    console.log(
      "2. After findBooking"
    );

    BookingCancellationService.validate(
      booking
    );

    console.log(
      "3. After validate"
    );

    const result =
      await BookingCancellationService.cancel(
        bookingId
      );

    console.log(
      "4. After cancel"
    );

    return result;
  }

  /**
   * ==========================================
   * Admin Cancel Booking
   * ==========================================
   */
  static async cancelBookingAsAdmin(
    bookingId: string
  ) {
    // -----------------------------------------
    // Find Booking
    // -----------------------------------------

    const booking =
      await prisma.booking.findUnique({
        where: {
          id: bookingId,
        },
      });

    // -----------------------------------------
    // Booking Not Found
    // -----------------------------------------

    if (!booking) {
      throw new AppError(
        "Booking not found.",
        404
      );
    }

    // -----------------------------------------
    // Validate Booking Status
    // -----------------------------------------

    if (
      booking.status !== "PENDING" &&
      booking.status !== "CONFIRMED"
    ) {
      throw new AppError(
        `Booking cannot be cancelled because its current status is ${booking.status}.`,
        400
      );
    }

    // -----------------------------------------
    // Cancel Booking
    // -----------------------------------------

    const cancelledBooking =
      await prisma.booking.update({
        where: {
          id: bookingId,
        },

        data: {
          status: "CANCELLED",
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              mobile: true,
            },
          },

          sport: {
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrl: true,
              pricePerHour: true,
            },
          },
        },
      });

    return cancelledBooking;
  }

  /**
   * ==========================================
   * Validate Booking Status Transition
   * ==========================================
   */
  static validateStatusTransition(
    currentStatus: BookingStatus,
    newStatus: BookingStatus
  ): void {
    // -----------------------------------------
    // Same Status
    // -----------------------------------------

    if (currentStatus === newStatus) {
      throw new AppError(
        `Booking is already ${currentStatus}.`,
        400
      );
    }

    // -----------------------------------------
    // PENDING
    // -----------------------------------------

    if (currentStatus === "PENDING") {
      const allowedStatuses:
        BookingStatus[] = [
          "CONFIRMED",
          "CANCELLED",
        ];

      if (
        !allowedStatuses.includes(
          newStatus
        )
      ) {
        throw new AppError(
          `Booking cannot be changed from ${currentStatus} to ${newStatus}.`,
          400
        );
      }

      return;
    }

    // -----------------------------------------
    // CONFIRMED
    // -----------------------------------------

    if (currentStatus === "CONFIRMED") {
      const allowedStatuses:
        BookingStatus[] = [
          "COMPLETED",
          "CANCELLED",
        ];

      if (
        !allowedStatuses.includes(
          newStatus
        )
      ) {
        throw new AppError(
          `Booking cannot be changed from ${currentStatus} to ${newStatus}.`,
          400
        );
      }

      return;
    }

    // -----------------------------------------
    // CANCELLED
    // -----------------------------------------

    if (currentStatus === "CANCELLED") {
      throw new AppError(
        "Cancelled bookings cannot be changed.",
        400
      );
    }

    // -----------------------------------------
    // COMPLETED
    // -----------------------------------------

    if (currentStatus === "COMPLETED") {
      throw new AppError(
        "Completed bookings cannot be changed.",
        400
      );
    }
  }

  /**
   * ==========================================
   * Admin Update Booking Status
   * ==========================================
   */
  static async updateBookingStatusAsAdmin(
    bookingId: string,
    newStatus: BookingStatus,
    changedById: string
  ) {
    // -----------------------------------------
    // Find Booking
    // -----------------------------------------

    const booking =
      await prisma.booking.findUnique({
        where: {
          id: bookingId,
        },
      });

    // -----------------------------------------
    // Booking Not Found
    // -----------------------------------------

    if (!booking) {
      throw new AppError(
        "Booking not found.",
        404
      );
    }

    // -----------------------------------------
    // Validate Status Transition
    // -----------------------------------------

    this.validateStatusTransition(
      booking.status,
      newStatus
    );

    // -----------------------------------------
    // Update Booking + Create History
    // -----------------------------------------

    const result =
      await prisma.$transaction(
        async (tx) => {
          // -----------------------------------
          // Update Booking Status
          // -----------------------------------

          const updatedBooking =
            await tx.booking.update({
              where: {
                id: bookingId,
              },

              data: {
                status: newStatus,
              },

              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    mobile: true,
                  },
                },

                sport: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    imageUrl: true,
                    pricePerHour: true,
                  },
                },
              },
            });

          // -----------------------------------
          // Create Status History
          // -----------------------------------

          await tx.bookingStatusHistory.create({
            data: {
              bookingId: booking.id,
              fromStatus: booking.status,
              toStatus: newStatus,
              changedById,
            },
          });

          // -----------------------------------
          // Return Updated Booking
          // -----------------------------------

          return updatedBooking;
        }
      );

    return result;
  }

  /**
   * ==========================================
   * Find Booking Or Throw
   * ==========================================
   */
  private static async findBookingOrThrow(
    userId: string,
    bookingId: string
  ) {
    console.log(
      "Route bookingId:",
      bookingId
    );

    const booking =
      await prisma.booking.findUnique({
        where: {
          id: bookingId,
        },

        include: {
          sport: {
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrl: true,
            },
          },
        },
      });

    console.log(
      "Booking from DB:",
      booking
    );

    if (!booking) {
      throw new AppError(
        BOOKING_MESSAGES.BOOKING_NOT_FOUND,
        404
      );
    }

    console.log(
      "Booking.userId:",
      booking.userId
    );

    console.log(
      "Current userId:",
      userId
    );

    if (booking.userId !== userId) {
      throw new AppError(
        BOOKING_MESSAGES.BOOKING_ACCESS_DENIED,
        403
      );
    }

    return booking;
  }
}
