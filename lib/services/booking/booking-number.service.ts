import { Prisma, BookingCounter,} from "@prisma/client";

import { BOOKING_CONFIG } from "./booking.config";

import { BookingNumberResult,} from "./booking.types";
import { formatBookingDate } from "./booking.utils";

export class BookingNumberService {
  /**
   * ==========================================
   * Generate Booking Number
   * ==========================================
   */
  static async generate(
    tx: Prisma.TransactionClient,
    bookingDate: Date
  ): Promise<BookingNumberResult> {
    const counter =
      await this.getOrCreateCounter(
        tx,
        bookingDate
      );

    const updatedCounter =
      await this.incrementCounter(
        tx,
        counter.id
      );

    return {
      bookingNumber:
        this.formatBookingNumber(
          bookingDate,
          updatedCounter.lastNumber
        ),
    };
  }

  /**
   * ==========================================
   * Get Or Create Counter
   * ==========================================
   */
  private static async getOrCreateCounter(
    tx: Prisma.TransactionClient,
    bookingDate: Date
  ): Promise<BookingCounter> {
    const normalizedDate = new Date(
      bookingDate
    );

    normalizedDate.setHours(
      0,
      0,
      0,
      0
    );

    let counter =
      await tx.bookingCounter.findUnique({
        where: {
          bookingDate: normalizedDate,
        },
      });

    if (!counter) {
      counter =
        await tx.bookingCounter.create({
          data: {
            bookingDate: normalizedDate,
            lastNumber: 0,
          },
        });
    }

    return counter;
  }

  /**
   * ==========================================
   * Increment Counter
   * ==========================================
   */
  private static async incrementCounter(
    tx: Prisma.TransactionClient,
    counterId: number
  ): Promise<BookingCounter> {
    return tx.bookingCounter.update({
      where: {
        id: counterId,
      },
      data: {
        lastNumber: {
          increment: 1,
        },
      },
    });
  }

  /**
   * ==========================================
   * Format Booking Number
   * ==========================================
   */
private static formatBookingNumber(
  bookingDate: Date,
  sequence: number
): string {
  const year = bookingDate.getFullYear();

  const month = String(
    bookingDate.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    bookingDate.getDate()
  ).padStart(2, "0");

  const date = `${year}${month}${day}`;

  return `${BOOKING_CONFIG.BOOKING_PREFIX}-${date}-${String(
    sequence
  ).padStart(6, "0")}`;
}
}