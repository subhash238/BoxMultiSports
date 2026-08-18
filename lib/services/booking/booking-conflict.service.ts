import { AppError } from "@/lib/errors";
import { Prisma, Sport } from "@prisma/client";
import { BOOKING_MESSAGES } from "./booking.responses";
import { BookingTimeResult } from "./booking.types";
import { BOOKING_CONFIG } from "./booking.config";

export class BookingConflictService {
  static async check(
    tx: Prisma.TransactionClient,
    sport: Sport,
    bookingTime: BookingTimeResult,
    numberOfPlayers: number
  ): Promise<void> {
    const pendingHoldStartedAt = new Date(
      Date.now() -
        BOOKING_CONFIG.PAYMENT_HOLD_MINUTES *
          60 *
          1000
    );

    if (sport.slug === "gym") {
      const overlappingBookings =
        await tx.booking.findMany({
          where: {
            sportId: sport.id,
            OR: [
              {
                status: "CONFIRMED",
                startTime: {
                  lt: bookingTime.endDateTime,
                },
                endTime: {
                  gt: bookingTime.startDateTime,
                },
              },
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
          select: {
            numberOfPlayers: true,
          },
        });

      const existingParticipants =
        overlappingBookings.reduce(
          (total, booking) =>
            total + booking.numberOfPlayers,
          0
        );

      if (
        existingParticipants + numberOfPlayers >
        sport.maxPlayers
      ) {
        throw new AppError(
          "Gym capacity is not available for the selected time.",
          409
        );
      }

      return;
    }

    const conflictingBooking =
      await this.findConflict(
        tx,
        sport.id,
        bookingTime,
        pendingHoldStartedAt
      );

    if (conflictingBooking !== null) {
      throw new AppError(
        BOOKING_MESSAGES.SLOT_ALREADY_BOOKED,
        409
      );
    }
  }

  private static async findConflict(
    tx: Prisma.TransactionClient,
    sportId: string,
    bookingTime: BookingTimeResult,
    pendingHoldStartedAt: Date
  ) {
    return tx.booking.findFirst({
      where: {
        sportId,
        OR: [
          {
            status: "CONFIRMED",
            startTime: {
              lt: bookingTime.endDateTime,
            },
            endTime: {
              gt: bookingTime.startDateTime,
            },
          },
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
}
