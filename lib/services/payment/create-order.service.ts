import { Payment, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { razorpay } from "@/lib/razorpay";
import { logger } from "@/lib/logger";

import { CreatePaymentInput } from "./payment.types";
import { PAYMENT_MESSAGES } from "./payment.responses";
import { verifyGuestPaymentToken } from "./guest-payment-token";

import { BOOKING_CONFIG } from "../booking/booking.config";

export type CreateOrderAuthorization =
  | {
      type: "AUTHENTICATED";
      userId: string;
    }
  | {
      type: "GUEST";
      guestPaymentToken: string;
    };

export class CreateOrderService {
  /**
   * Creates the internal payment record.
   */
  static async createPayment(
    data: CreatePaymentInput
  ): Promise<Payment> {
    if (!Number.isFinite(data.amount) || data.amount <= 0) {
      throw new AppError(
        PAYMENT_MESSAGES.INVALID_PAYMENT_AMOUNT,
        400
      );
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: data.bookingId,
      },
      select: {
        id: true,
        totalAmount: true,
        status: true,
      },
    });

    if (!booking) {
      throw new AppError(
        PAYMENT_MESSAGES.BOOKING_NOT_FOUND,
        404
      );
    }

    const existingPayment =
      await prisma.payment.findUnique({
        where: {
          bookingId: data.bookingId,
        },
      });

    if (existingPayment) {
      throw new AppError(
        PAYMENT_MESSAGES.PAYMENT_ALREADY_EXISTS,
        409
      );
    }

    return prisma.payment.create({
      data: {
        bookingId: data.bookingId,
        amount: data.amount,
        currency: data.currency ?? "INR",
        status: "PENDING",
      },
    });
  }

  /**
   * Creates a Razorpay order and connects it
   * to the internal payment record.
   */
  static async createRazorpayOrder(
    bookingId: string,
    authorization: CreateOrderAuthorization
  ) {
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      select: {
        id: true,
        bookingNumber: true,
        totalAmount: true,
        status: true,
        userId: true,
        createdAt: true,
        reservationExpiresAt: true,
        guestPaymentTokenHash: true,
        guestPaymentTokenExpiresAt: true,
      },
    });

    if (!booking) {
      throw new AppError(
        PAYMENT_MESSAGES.BOOKING_NOT_FOUND,
        404
      );
    }

    if (booking.status !== "PENDING") {
      throw new AppError(
        `Payment cannot be created for a booking with status ${booking.status}.`,
        400
      );
    }

    const now = new Date();

    // -----------------------------------------
    // Authorize Booking Payment
    // -----------------------------------------

    if (authorization.type === "AUTHENTICATED") {
      if (
        booking.userId === null ||
        booking.userId !== authorization.userId
      ) {
        throw new AppError(
          "You are not authorized to pay for this booking.",
          403
        );
      }
    } else {
      const guestAuthorizationError = new AppError(
        "You are not authorized to pay for this booking.",
        403
      );

      if (
        booking.userId !== null ||
        !booking.guestPaymentTokenHash ||
        !booking.guestPaymentTokenExpiresAt
      ) {
        throw guestAuthorizationError;
      }

      if (now >= booking.guestPaymentTokenExpiresAt) {
        throw new AppError(
          "Guest payment authorization has expired.",
          403
        );
      }

      if (
        !verifyGuestPaymentToken(
          authorization.guestPaymentToken,
          booking.guestPaymentTokenHash
        )
      ) {
        throw guestAuthorizationError;
      }
    }

    // -----------------------------------------
    // Validate Active Booking Reservation
    // -----------------------------------------

    const reservationExpiresAt =
      booking.reservationExpiresAt ??
      new Date(
        booking.createdAt.getTime() +
          BOOKING_CONFIG.PAYMENT_HOLD_MINUTES * 60 * 1000
      );

    if (now >= reservationExpiresAt) {
      throw new AppError(
        "The reservation for this booking has expired. Please create a new booking.",
        409
      );
    }

    const isGuestAuthorization =
      authorization.type === "GUEST";

    const amount = Number(booking.totalAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new AppError(
        PAYMENT_MESSAGES.INVALID_PAYMENT_AMOUNT,
        400
      );
    }

    const existingPayment =
      await prisma.payment.findUnique({
        where: {
          bookingId,
        },
      });

    // A failed attempt may be retried: the new
    // order replaces the failed one. Any other
    // existing order blocks duplicates.
    const retryingFailedPayment =
      existingPayment?.status === "FAILED";

    if (
      existingPayment?.razorpayOrderId &&
      !retryingFailedPayment
    ) {
      throw new AppError(
        "Razorpay order already exists for this booking.",
        409
      );
    }

    const amountInPaise = Math.round(amount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: booking.bookingNumber,
      notes: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
      },
    });

    const checkoutStartedAt = new Date();
    const checkoutExpiresAt = new Date(
      checkoutStartedAt.getTime() +
        BOOKING_CONFIG.PAYMENT_CHECKOUT_HOLD_MINUTES *
          60 *
          1000
    );

    const guestAuthorizedAt = isGuestAuthorization
      ? checkoutStartedAt
      : null;

    let payment: Payment;

    try {
      payment = await prisma.$transaction(
        async (tx) => {
          const currentBooking =
            await tx.booking.findUnique({
              where: {
                id: booking.id,
              },
              select: {
                id: true,
                status: true,
                createdAt: true,
                reservationExpiresAt: true,
              },
            });

          if (!currentBooking) {
            throw new AppError(
              PAYMENT_MESSAGES.BOOKING_NOT_FOUND,
              404
            );
          }

          if (currentBooking.status !== "PENDING") {
            throw new AppError(
              `Payment cannot be created for a booking with status ${currentBooking.status}.`,
              400
            );
          }

          const transactionNow = new Date();
          const currentReservationExpiresAt =
            currentBooking.reservationExpiresAt ??
            new Date(
              currentBooking.createdAt.getTime() +
                BOOKING_CONFIG.PAYMENT_HOLD_MINUTES *
                  60 *
                  1000
            );

          if (
            transactionNow >=
            currentReservationExpiresAt
          ) {
            throw new AppError(
              "The reservation for this booking has expired. Please create a new booking.",
              409
            );
          }

          const currentPayment =
            await tx.payment.findUnique({
              where: {
                bookingId,
              },
            });

          const retryingFailed =
            currentPayment?.status === "FAILED";

          if (
            currentPayment?.razorpayOrderId &&
            !retryingFailed
          ) {
            throw new AppError(
              "Razorpay order already exists for this booking.",
              409
            );
          }

          const persistedPayment = currentPayment
            ? await tx.payment.update({
                where: {
                  id: currentPayment.id,
                },
                data: {
                  razorpayOrderId: razorpayOrder.id,
                  guestAuthorizedAt,
                  ...(retryingFailed && {
                    status: "PENDING" as const,
                    razorpayPaymentId: null,
                    razorpaySignature: null,
                    failureCode: null,
                    failureMessage: null,
                  }),
                },
              })
            : await tx.payment.create({
                data: {
                  bookingId: booking.id,
                  amount: booking.totalAmount,
                  currency: "INR",
                  status: "PENDING",
                  razorpayOrderId: razorpayOrder.id,
                  guestAuthorizedAt,
                },
              });

          await tx.booking.update({
            where: {
              id: currentBooking.id,
            },
            data: {
              reservationExpiresAt: checkoutExpiresAt,
              ...(isGuestAuthorization && {
                guestPaymentTokenExpiresAt:
                  checkoutExpiresAt,
              }),
            },
          });

          return persistedPayment;
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.Serializable,
        }
      );
    } catch (error) {
      logger.error(
        "Razorpay order created but local checkout persistence failed.",
        {
          bookingId: booking.id,
          razorpayOrderId: razorpayOrder.id,
          failure:
            error instanceof Error
              ? error.message
              : "Unknown local persistence failure.",
        }
      );

      throw error;
    }

    return {
      payment,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
      },
    };
  }
}
