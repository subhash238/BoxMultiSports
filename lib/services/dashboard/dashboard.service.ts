import { BookingStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export class DashboardService {
  /**
   * ==========================================
   * Dashboard Statistics
   * ==========================================
   */
  static async getStats() {
    const [
      sports,
      bookings,
      customers,
      revenue,
    ] = await Promise.all([
      prisma.sport.count(),

      prisma.booking.count(),

      prisma.user.count({
        where: {
          role: "CUSTOMER",
        },
      }),

      prisma.booking.aggregate({
        where: {
          status: {
            not: BookingStatus.CANCELLED,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    return {
      sports,
      bookings,
      customers,

      revenue:
        Number(
          revenue._sum.totalAmount ?? 0
        ),
    };
  }
 /**
 * ==========================================
 * Recent Bookings
 * ==========================================
 */
static async getRecentBookings() {
  const bookings = await prisma.booking.findMany({
    take: 5,

    orderBy: {
      createdAt: "desc",
    },

    include: {
      user: {
        select: {
          name: true,
        },
      },

      sport: {
        select: {
          name: true,
        },
      },
    },
  });

  return bookings.map((booking) => ({
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    totalAmount: Number(booking.totalAmount),
    status: booking.status,
    user: {
      name: booking.user.name,
    },
    sport: {
      name: booking.sport.name,
    },
  }));
} }