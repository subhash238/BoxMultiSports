import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

import {
  CreateBookingContext,
  CreateBookingResult,
} from "./booking.types";

import {
  BookingNumberService,
} from "./booking-number.service";

import { BookingConflictService } from "./booking-conflict.service";

import { BOOKING_CONFIG } from "./booking.config";
import {
  generateGuestPaymentToken,
  hashGuestPaymentToken,
} from "../payment/guest-payment-token";

export class BookingTransactionService {
  /**
   * ==========================================
   * Create Booking Transaction
   * ==========================================
   */
  static async create(
    context: CreateBookingContext
  ): Promise<CreateBookingResult> {
    const isGuest =
      context.userId === null;

    const guestPaymentToken = isGuest
      ? generateGuestPaymentToken()
      : null;

    const guestPaymentTokenHash =
      guestPaymentToken === null
        ? null
        : hashGuestPaymentToken(
            guestPaymentToken
          );

    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await prisma.$transaction(
          async (tx) => {
            await BookingConflictService.check(
              tx,
              context.sport,
              context.bookingTime,
              context.numberOfPlayers
            );

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

        const createdBooking =
          await tx.booking.create({
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

            customerName:
              context.customerName,

            customerEmail:
              context.customerEmail,

            customerMobile:
              context.customerMobile,

            specialRequest:
              context.specialRequest,

            status: "PENDING",

            userId:
              context.userId,

            guestPaymentTokenHash,

            guestPaymentTokenExpiresAt:
              null,

            sportId:
              context.sport.id,
          },
          });

        const reservationExpiresAt =
          new Date(
            createdBooking.createdAt.getTime() +
              BOOKING_CONFIG.PAYMENT_HOLD_MINUTES *
                60 *
                1000
          );

        const finalBooking =
          await tx.booking.update({
            where: {
              id: createdBooking.id,
            },
            data: {
              reservationExpiresAt,
              ...(isGuest && {
                guestPaymentTokenExpiresAt:
                  reservationExpiresAt,
              }),
            },
          });

        return {
          booking: finalBooking,
          guestPaymentToken,
        };
          },
          {
            isolationLevel:
              Prisma.TransactionIsolationLevel.Serializable,
          }
        );
      } catch (error) {
        const isSerializationConflict =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2034";

        if (!isSerializationConflict) {
          throw error;
        }

        if (attempt === maxAttempts) {
          throw new AppError(
            "Booking availability changed. Please try again.",
            409
          );
        }
      }
    }

    throw new AppError(
      "Booking availability changed. Please try again.",
      409
    );
  }
}
