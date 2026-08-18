import { BookingStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

import { BOOKING_MESSAGES } from "./booking.responses";

export class BookingCancellationService {
  /**
   * ==========================================
   * Cancel Booking
   * ==========================================
   */
  static async cancel(
  bookingId: string
) {
  const booking = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status: BookingStatus.CANCELLED,
    },
  });

  return booking;
}

  /**
   * ==========================================
   * Validate Cancellation
   * ==========================================
   */
  static validate(
    booking: {
      status: BookingStatus;
      startTime: Date;
    }
  ) {
    if (
      booking.status ===
      BookingStatus.CANCELLED
    ) {
      throw new AppError(
        BOOKING_MESSAGES.BOOKING_ALREADY_CANCELLED,
        400
      );
    }

    if (
      booking.status ===
      BookingStatus.COMPLETED
    ) {
      throw new AppError(
        BOOKING_MESSAGES.BOOKING_COMPLETED,
        400
      );
    }

    if (
      booking.startTime <= new Date()
    ) {
      throw new AppError(
        BOOKING_MESSAGES.CANNOT_CANCEL_STARTED_BOOKING,
        400
      );
    }
  }
}
