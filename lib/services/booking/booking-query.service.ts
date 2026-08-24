import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { normalizeDate } from "./booking.utils";

import {
  BookingListQuery,
  BookingListResult,
} from "./booking.types";

export class BookingQueryService {
  /**
   * ==========================================
   * Get User Bookings
   * ==========================================
   */
  static async getUserBookings(
    userId: string,
    query: BookingListQuery
  ): Promise<BookingListResult> {
    const page = Math.max(1, query.page);
    const limit = Math.max(1, query.limit);

    const skip = (page - 1) * limit;

    const where = {
      userId,

      ...(query.status && {
        status: query.status as BookingStatus,
      }),
    };

    const [bookings, total] =
      await prisma.$transaction([
        prisma.booking.findMany({
          where,
          skip,
          take: limit,

          orderBy: {
            createdAt: "desc",
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
        }),

        prisma.booking.count({
          where,
        }),
      ]);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(
          total / limit
        ),
      },
    };
  }

  /**
   * ==========================================
   * Get All Bookings - Admin
   * ==========================================
   */
  static async getAdminBookings(
    query: BookingListQuery
  ): Promise<BookingListResult> {
    const page = Math.max(1, query.page);
    const limit = Math.max(1, query.limit);

    const skip = (page - 1) * limit;

    // ==========================================
    // Date Filter
    // ==========================================

    const now = new Date();

    const startOfToday = normalizeDate(now);

    const startOfTomorrow = new Date(
      startOfToday
    );

    startOfTomorrow.setUTCDate(
      startOfTomorrow.getUTCDate() + 1
    );

    // ==========================================
    // Build Where
    // ==========================================

    const where: any = {};

    // ==========================================
    // Status Filter
    // ==========================================

    if (query.status) {
      where.status =
        query.status as BookingStatus;
    }

    // ==========================================
    // Date Filter
    // ==========================================

    if (
      query.dateFilter === "TODAY"
    ) {
      where.bookingDate = {
        gte: startOfToday,
        lt: startOfTomorrow,
      };
    }

    if (
      query.dateFilter === "UPCOMING"
    ) {
      where.bookingDate = {
        gte: startOfTomorrow,
      };
    }

    if (
      query.dateFilter === "PAST"
    ) {
      where.bookingDate = {
        lt: startOfToday,
      };
    }

    // ==========================================
    // Search Filter
    // ==========================================

    if (query.search) {
      where.OR = [
        {
          bookingNumber: {
            contains: query.search,
            mode: "insensitive",
          },
        },

        {
          customerName: {
            contains: query.search,
            mode: "insensitive",
          },
        },

        {
          customerEmail: {
            contains: query.search,
            mode: "insensitive",
          },
        },

        {
          customerMobile: {
            contains: query.search,
            mode: "insensitive",
          },
        },

        {
          user: {
            name: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },

        {
          user: {
            email: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },

        {
          user: {
            mobile: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // ==========================================
    // Get Bookings + Total
    // ==========================================

    const [bookings, total] =
      await prisma.$transaction([
        prisma.booking.findMany({
          where,

          skip,
          take: limit,

          orderBy: {
            bookingDate: "desc",
          },

          select: {
            id: true,
            bookingNumber: true,
            bookingDate: true,
            startTime: true,
            endTime: true,
            duration: true,
            numberOfPlayers: true,
            totalAmount: true,
            status: true,

            customerName: true,
            customerEmail: true,
            customerMobile: true,
            specialRequest: true,

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
              },
            },
          },
        }),

        prisma.booking.count({
          where,
        }),
      ]);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(
          total / limit
        ),
      },
    };
  }
}