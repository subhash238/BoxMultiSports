import { prisma } from "@/lib/prisma";
import { BookingExpiryService } from "@/lib/services/booking/booking-expiry.service";

interface AccountUser {
  id: string;
  email: string;
  mobile: string;
}

/**
 * Customer-facing account data. Bookings/memberships are
 * matched by userId OR the customer's mobile/email, so
 * guest purchases made before signing up still show up.
 */
export class AccountService {
  private static ownerFilter(user: AccountUser) {
    return {
      OR: [
        { userId: user.id },
        { customerMobile: user.mobile },
        { customerEmail: { equals: user.email, mode: "insensitive" as const } },
      ],
    };
  }

  static async getBookings(user: AccountUser) {
    await BookingExpiryService.expireStalePendingBookings().catch(() => undefined);

    const bookings = await prisma.booking.findMany({
      where: this.ownerFilter(user),
      orderBy: { startTime: "desc" },
      take: 100,
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
        paymentMethod: true,
        createdAt: true,
        sport: { select: { id: true, name: true, slug: true, imageUrl: true } },
        payment: { select: { status: true } },
      },
    });

    return bookings.map((b) => ({
      ...b,
      totalAmount: b.totalAmount.toString(),
      paymentStatus: b.payment?.status ?? null,
      payment: undefined,
    }));
  }

  static async getMemberships(user: AccountUser) {
    const memberships = await prisma.membership.findMany({
      where: this.ownerFilter(user),
      orderBy: { endDate: "desc" },
      take: 50,
      select: {
        id: true,
        membershipNumber: true,
        startDate: true,
        endDate: true,
        amount: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        paidAt: true,
        createdAt: true,
        plan: { select: { id: true, slug: true, name: true, features: true } },
      },
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    return memberships.map((m) => {
      const daysLeft = Math.ceil(
        (m.endDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
      );
      const isExpired = m.status === "ACTIVE" && daysLeft < 0;

      return {
        ...m,
        amount: m.amount.toString(),
        daysLeft: Math.max(daysLeft, 0),
        displayStatus: isExpired ? ("EXPIRED" as const) : m.status,
      };
    });
  }
}
