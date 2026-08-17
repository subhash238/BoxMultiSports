import { prisma } from "@/lib/prisma";

import {
  CreateBookingContext,
  CreateBookingResult,
} from "./booking.types";

import {
  BookingNumberService,
} from "./booking-number.service";

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

            customerMobile:
              context.customerMobile,

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

        let finalBooking =
          createdBooking;

        if (isGuest) {
          const guestPaymentTokenExpiresAt =
            new Date(
              createdBooking.createdAt.getTime() +
                BOOKING_CONFIG.PAYMENT_HOLD_MINUTES *
                  60 *
                  1000
            );

          finalBooking =
            await tx.booking.update({
              where: {
                id: createdBooking.id,
              },
              data: {
                guestPaymentTokenExpiresAt,
              },
            });
        }

        return {
          booking: finalBooking,
          guestPaymentToken,
        };
      }
    );
  }
}
