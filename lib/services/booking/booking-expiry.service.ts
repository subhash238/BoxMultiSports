import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

import { BOOKING_CONFIG } from "./booking.config";

/**
 * ==========================================
 * Booking Expiry Service
 * ==========================================
 *
 * Cancels PENDING bookings whose payment
 * reservation window has elapsed. Called lazily
 * from read paths (admin list, availability) so
 * no external cron is required.
 *
 * Reservations that reach Razorpay checkout are
 * left PENDING until the checkout hold ends —
 * the payment flow owns them after that.
 */
export class BookingExpiryService {
  /**
   * Cancels expired unpaid reservations.
   * Returns the number of bookings cancelled.
   */
  static async expireStalePendingBookings(
    now = new Date()
  ): Promise<number> {
    // Pre-reservationExpiresAt rows: createdAt
    // plus the initial hold is the cutoff.
    const legacyCutoff = new Date(
      now.getTime() -
        BOOKING_CONFIG.PAYMENT_HOLD_MINUTES * 60 * 1000
    );

    const expired = await prisma.booking.findMany({
      where: {
        status: "PENDING",
        OR: [
          {
            reservationExpiresAt: {
              lt: now,
            },
          },
          {
            reservationExpiresAt: null,
            createdAt: {
              lt: legacyCutoff,
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (expired.length === 0) {
      return 0;
    }

    const ids = expired.map((booking) => booking.id);

    await prisma.$transaction([
      prisma.booking.updateMany({
        where: {
          id: { in: ids },
          status: "PENDING",
        },
        data: {
          status: "CANCELLED",
        },
      }),
      prisma.bookingStatusHistory.createMany({
        data: ids.map((id) => ({
          bookingId: id,
          fromStatus: "PENDING" as const,
          toStatus: "CANCELLED" as const,
          actorType: "SYSTEM" as const,
          changedById: null,
        })),
      }),
    ]);

    logger.info("Expired stale pending bookings.", {
      count: ids.length,
    });

    return ids.length;
  }
}
