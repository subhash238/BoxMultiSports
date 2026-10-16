import {
  PaymentRecoveryState,
  Prisma,
} from "@prisma/client";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { razorpay } from "@/lib/razorpay";
import { logger } from "@/lib/logger";

import { PAYMENT_MESSAGES } from "./payment.responses";
import { verifyGuestPaymentToken } from "./guest-payment-token";

import { BOOKING_CONFIG } from "../booking/booking.config";

export type VerifyPaymentAuthorization =
  | {
      type: "AUTHENTICATED";
      userId: string;
    }
  | {
      type: "GUEST";
      guestPaymentToken: string;
    };

export const RECOVERY_MESSAGE =
  "Payment was received, but the reservation expired and the booking could not be confirmed. The payment requires refund review. Please contact support with your booking number.";

export class VerifyPaymentService {
  /**
   * Verifies that the Razorpay response has
   * not been modified.
   */
  static verifyRazorpaySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): boolean {
    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return false;
    }

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpaySecret) {
      throw new AppError(
        "Razorpay secret key is not configured.",
        500
      );
    }

    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;

    const expectedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(payload)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const receivedBuffer = Buffer.from(razorpaySignature, "utf8");

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    try {
      return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Verifies a payment initiated through Razorpay
   * checkout, marks it CAPTURED, and confirms the
   * booking — or flags it for recovery review when
   * the reservation already expired.
   */
  static async verifyRazorpayPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    authorization: VerifyPaymentAuthorization
  ) {
    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      throw new AppError(
        "Razorpay payment verification data is required.",
        400
      );
    }

    const payment = await prisma.payment.findFirst({
      where: {
        razorpayOrderId,
      },
      include: {
        booking: {
          select: {
            id: true,
            userId: true,
            bookingNumber: true,
            status: true,
            createdAt: true,
            guestPaymentTokenHash: true,
            guestPaymentTokenExpiresAt: true,
          },
        },
      },
    });

    if (!payment) {
      throw new AppError(
        PAYMENT_MESSAGES.PAYMENT_NOT_FOUND,
        404
      );
    }

    const authorizePaymentVerification = (
      paymentRecord: {
        guestAuthorizedAt: Date | null;
        booking: {
          userId: string | null;
          guestPaymentTokenHash: string | null;
          guestPaymentTokenExpiresAt: Date | null;
        };
      },
      allowExpiredGuestToken = false
    ) => {
      if (authorization.type === "AUTHENTICATED") {
        if (
          paymentRecord.booking.userId === null ||
          paymentRecord.booking.userId !==
            authorization.userId
        ) {
          throw new AppError(
            "You are not authorized to verify this payment.",
            403
          );
        }

        return;
      }

      if (
        paymentRecord.booking.userId !== null ||
        paymentRecord.guestAuthorizedAt === null ||
        !paymentRecord.booking.guestPaymentTokenHash ||
        (!allowExpiredGuestToken &&
          (!paymentRecord.booking
            .guestPaymentTokenExpiresAt ||
            new Date() >=
              paymentRecord.booking
                .guestPaymentTokenExpiresAt)) ||
        !verifyGuestPaymentToken(
          authorization.guestPaymentToken,
          paymentRecord.booking.guestPaymentTokenHash
        )
      ) {
        throw new AppError(
          "You are not authorized to verify this payment.",
          403
        );
      }
    };

    if (payment.status === "CAPTURED") {
      const isTerminalRecovery =
        payment.recoveryState ===
          PaymentRecoveryState.REVIEW_REQUIRED &&
        payment.booking.status === "CANCELLED";

      authorizePaymentVerification(
        payment,
        payment.booking.status === "CONFIRMED" ||
          isTerminalRecovery
      );

      if (
        typeof payment.razorpayOrderId !== "string" ||
        !payment.razorpayOrderId ||
        typeof payment.razorpayPaymentId !== "string" ||
        !payment.razorpayPaymentId ||
        payment.razorpayOrderId !== razorpayOrderId ||
        payment.razorpayPaymentId !== razorpayPaymentId
      ) {
        throw new AppError(
          "Payment verification failed.",
          400
        );
      }

      const signatureValid = this.verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!signatureValid) {
        throw new AppError(
          "Payment verification failed.",
          400
        );
      }

      if (isTerminalRecovery) {
        throw new AppError(RECOVERY_MESSAGE, 409);
      }

      if (payment.booking.status !== "CONFIRMED") {
        throw new AppError(
          "Payment verification failed.",
          400
        );
      }

      return {
        payment,
        booking: payment.booking,
      };
    }

    authorizePaymentVerification(
      payment,
      payment.status === "PENDING"
    );

    const signatureValid = this.verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!signatureValid) {
      throw new AppError(
        "Invalid Razorpay payment signature.",
        400
      );
    }

    let razorpayPayment;

    try {
      razorpayPayment = await razorpay.payments.fetch(
        razorpayPaymentId
      );
    } catch {
      throw new AppError(
        "Payment verification failed.",
        400
      );
    }

    const expectedAmountInPaise = Math.round(
      Number(payment.amount) * 100
    );

    const razorpayAmountInPaise = Number(
      razorpayPayment.amount
    );

    const reconciliationFailed =
      !razorpayPayment.id ||
      razorpayPayment.id !== razorpayPaymentId ||
      (payment.razorpayPaymentId !== null &&
        payment.razorpayPaymentId !==
          razorpayPaymentId) ||
      !payment.razorpayOrderId ||
      payment.razorpayOrderId !== razorpayOrderId ||
      razorpayPayment.order_id !== razorpayOrderId ||
      razorpayPayment.order_id !==
        payment.razorpayOrderId ||
      !Number.isFinite(expectedAmountInPaise) ||
      !Number.isFinite(razorpayAmountInPaise) ||
      razorpayAmountInPaise !== expectedAmountInPaise ||
      payment.currency !== "INR" ||
      razorpayPayment.currency !== payment.currency ||
      razorpayPayment.status !== "captured" ||
      razorpayPayment.captured !== true;

    if (reconciliationFailed) {
      throw new AppError(
        "Payment verification failed.",
        400
      );
    }

    // -----------------------------------------
    // Confirm Payment + Booking
    // -----------------------------------------

    const runVerificationTransaction = () =>
      prisma.$transaction(
        async (tx) => {
          const currentPayment =
            await tx.payment.findUnique({
              where: {
                id: payment.id,
              },
              include: {
                booking: {
                  select: {
                    id: true,
                    userId: true,
                    bookingNumber: true,
                    status: true,
                    createdAt: true,
                    reservationExpiresAt: true,
                    guestPaymentTokenHash: true,
                    guestPaymentTokenExpiresAt: true,
                  },
                },
              },
            });

          if (!currentPayment) {
            throw new AppError(
              PAYMENT_MESSAGES.PAYMENT_NOT_FOUND,
              404
            );
          }

          authorizePaymentVerification(
            currentPayment,
            currentPayment.status === "PENDING" ||
              (currentPayment.status === "CAPTURED" &&
                (currentPayment.booking.status ===
                  "CONFIRMED" ||
                  (currentPayment.recoveryState ===
                    PaymentRecoveryState.REVIEW_REQUIRED &&
                    currentPayment.booking.status ===
                      "CANCELLED")))
          );

          // Already captured
          if (currentPayment.status === "CAPTURED") {
            const isTerminalRecovery =
              currentPayment.recoveryState ===
                PaymentRecoveryState.REVIEW_REQUIRED &&
              currentPayment.booking.status ===
                "CANCELLED";

            if (
              currentPayment.razorpayOrderId !==
                razorpayOrderId ||
              currentPayment.razorpayPaymentId !==
                razorpayPaymentId
            ) {
              throw new AppError(
                "Payment verification failed.",
                400
              );
            }

            if (isTerminalRecovery) {
              return {
                type: "RECOVERY_REPLAY" as const,
                payment: currentPayment,
                booking: currentPayment.booking,
              };
            }

            if (
              currentPayment.booking.status !==
              "CONFIRMED"
            ) {
              throw new AppError(
                "Payment verification failed.",
                400
              );
            }

            return {
              type: "SUCCESS" as const,
              payment: currentPayment,
              booking: currentPayment.booking,
            };
          }

          if (
            currentPayment.booking.status !== "PENDING"
          ) {
            throw new AppError(
              `Payment cannot confirm a booking with status ${currentPayment.booking.status}.`,
              400
            );
          }

          // reservationExpiresAt is authoritative.
          // Historical null values temporarily use
          // createdAt plus the initial payment hold.
          const transactionNow = new Date();
          const effectiveReservationExpiresAt =
            currentPayment.booking
              .reservationExpiresAt ??
            new Date(
              currentPayment.booking.createdAt.getTime() +
                BOOKING_CONFIG.PAYMENT_HOLD_MINUTES *
                  60 *
                  1000
            );

          if (
            transactionNow >=
            effectiveReservationExpiresAt
          ) {
            // Razorpay already captured the money,
            // so persist that provider truth, cancel
            // the booking, and flag for refund review.
            const capturedPayment =
              await tx.payment.update({
                where: {
                  id: currentPayment.id,
                },
                data: {
                  status: "CAPTURED",
                  razorpayPaymentId,
                  razorpaySignature,
                  recoveryState:
                    PaymentRecoveryState.REVIEW_REQUIRED,
                },
              });

            const cancelledBooking =
              await tx.booking.update({
                where: {
                  id: currentPayment.booking.id,
                },
                data: {
                  status: "CANCELLED",
                },
                select: {
                  id: true,
                  userId: true,
                  bookingNumber: true,
                  status: true,
                  createdAt: true,
                },
              });

            await tx.bookingStatusHistory.create({
              data: {
                bookingId: currentPayment.booking.id,
                fromStatus: "PENDING",
                toStatus: "CANCELLED",
                actorType: "SYSTEM",
                changedById: null,
              },
            });

            return {
              type: "EXPIRED" as const,
              payment: capturedPayment,
              booking: cancelledBooking,
            };
          }

          const updatedPayment = await tx.payment.update({
            where: {
              id: currentPayment.id,
            },
            data: {
              status: "CAPTURED",
              razorpayPaymentId,
              razorpaySignature,
            },
          });

          const updatedBooking = await tx.booking.update({
            where: {
              id: currentPayment.booking.id,
            },
            data: {
              status: "CONFIRMED",
            },
            select: {
              id: true,
              userId: true,
              bookingNumber: true,
              status: true,
              createdAt: true,
            },
          });

          await tx.bookingStatusHistory.create({
            data: {
              bookingId: currentPayment.booking.id,
              fromStatus: "PENDING",
              toStatus: "CONFIRMED",
              actorType: "PAYMENT",
              changedById: null,
            },
          });

          return {
            type: "SUCCESS" as const,
            payment: updatedPayment,
            booking: updatedBooking,
          };
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.Serializable,
        }
      );

    type VerificationTransactionResult = Awaited<
      ReturnType<typeof runVerificationTransaction>
    >;

    const maxAttempts = 3;
    let result: VerificationTransactionResult | null =
      null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        result = await runVerificationTransaction();
        break;
      } catch (error) {
        const isSerializationConflict =
          error instanceof
            Prisma.PrismaClientKnownRequestError &&
          error.code === "P2034";

        if (!isSerializationConflict) {
          throw error;
        }

        if (attempt === maxAttempts) {
          throw new AppError(
            "Payment verification state changed. Please try again.",
            409
          );
        }
      }
    }

    if (result === null) {
      throw new AppError(
        "Payment verification state changed. Please try again.",
        409
      );
    }

    if (result.type === "EXPIRED") {
      logger.warn(
        "Razorpay payment was captured but the booking reservation expired before local confirmation.",
        {
          bookingId: payment.booking.id,
          bookingNumber: payment.booking.bookingNumber,
          razorpayOrderId,
          razorpayPaymentId,
          recoveryState:
            PaymentRecoveryState.REVIEW_REQUIRED,
        }
      );
    }

    if (
      result.type === "EXPIRED" ||
      result.type === "RECOVERY_REPLAY"
    ) {
      throw new AppError(RECOVERY_MESSAGE, 409);
    }

    return {
      payment: result.payment,
      booking: result.booking,
    };
  }
}
