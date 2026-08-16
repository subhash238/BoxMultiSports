import { prisma } from "@/lib/prisma";

import { Booking } from "@prisma/client";

import {
  CreateBookingContext,
} from "./booking.types";

import {
  BookingNumberService,
} from "./booking-number.service";

export class BookingTransactionService {
  /**
   * ==========================================
   * Create Booking Transaction
   * ==========================================
   */
  static async create(
    context: CreateBookingContext
  ): Promise<Booking> {
    return prisma.$transaction(
      async (tx) => {
        // -----------------------------------------
        // Generate Booking Number
        // -----------------------------------------

        const { bookingNumber } =
          await BookingNumberService.generate(
            tx,
            context.bookingTime.bookingDate
          );

        // -----------------------------------------
        // Create Booking
        // -----------------------------------------

        return tx.booking.create({
          data: {
            bookingNumber,

            bookingDate:
              context.bookingTime.bookingDate,

            startTime:
              context.bookingTime.startDateTime,

            endTime:
              context.bookingTime.endDateTime,

            duration:
              context.pricing.durationMinutes,

            // Player count validated by
            // BookingValidationService.
            numberOfPlayers:
              context.numberOfPlayers,

            // Fixed price from SportPricing.
            totalAmount:
              context.pricing.totalAmount,

            status: "PENDING",

            userId:
              context.userId,

            sportId:
              context.sport.id,
          },
        });
      }
    );
  }
}