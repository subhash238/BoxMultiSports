import {
  PaymentRecoveryState,
  Prisma,
} from "@prisma/client";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

import { PAYMENT_MESSAGES } from "./payment.responses";

import { BOOKING_CONFIG } from "../booking/booking.config";
import { NotificationService } from "../notification/email.service";
import { MembershipService } from "../membership/membership.service";

/**
 * ==========================================
 * Razorpay Webhook Service
 * ==========================================
 *
 * Server-to-server reconciliation for payments
 * whose browser verification never arrived
 * (customer closed the tab, network drop, etc.).
 *
 * Handles:
 *  - payment.captured → confirm booking (or flag
 *    recovery when the reservation expired)
 *  - payment.failed   → mark payment FAILED
 */

interface RazorpayPaymentEntity {
  id?: string;
  order_id?: string;
  amount?: number | string;
  currency?: string;
  status?: string;
  error_code?: string | null;
  error_description?: string | null;
}

interface RazorpayWebhookPayload {
  event?: string;
  payload?: {
    payment?: {
      entity?: RazorpayPaymentEntity;
    };
  };
}

export class PaymentWebhookService {
  /**
   * Verifies the X-Razorpay-Signature header
   * against the raw request body.
   */
  static verifyWebhookSignature(
    rawBody: string,
    signature: string
  ): boolean {
    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new AppError(
        "Razorpay webhook secret is not configured.",
        500
      );
    }

    if (!signature) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(
      expectedSignature,
      "utf8"
    );
    const receivedBuffer = Buffer.from(signature, "utf8");

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    try {
      return crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      );
    } catch {
      return false;
    }
  }

  /**
   * Entry point: verifies + dispatches the event.
   * Safe to call repeatedly — every handler is
   * idempotent.
   */
  static async handleWebhook(
    rawBody: string,
    signature: string
  ): Promise<void> {
    if (
      !this.verifyWebhookSignature(rawBody, signature)
    ) {
      throw new AppError(
        "Invalid webhook signature.",
        400
      );
    }

    let event: RazorpayWebhookPayload;

    try {
      event = JSON.parse(rawBody);
    } catch {
      throw new AppError(
        "Invalid webhook payload.",
        400
      );
    }

    const paymentEntity = event.payload?.payment?.entity;

    switch (event.event) {
      case "payment.captured":
        await this.handlePaymentCaptured(paymentEntity);
        break;

      case "payment.failed":
        await this.handlePaymentFailed(paymentEntity);
        break;

      default:
        logger.info("Ignoring unhandled Razorpay webhook event.", {
          event: event.event,
        });
    }
  }

  /**
   * payment.captured
   *
   * Confirms the booking when the reservation is
   * still valid; otherwise records the capture and
   * flags the payment for refund review.
   */
  private static async handlePaymentCaptured(
    entity: RazorpayPaymentEntity | undefined
  ): Promise<void> {
    if (!entity?.id || !entity.order_id) {
      logger.warn(
        "payment.captured webhook missing entity ids.",
        { entity }
      );
      return;
    }

    const payment = await prisma.payment.findFirst({
      where: {
        razorpayOrderId: entity.order_id,
      },
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            status: true,
            createdAt: true,
            reservationExpiresAt: true,
          },
        },
      },
    });

    if (!payment) {
      const handledAsMembership =
        await MembershipService.handleWebhookCapture({
          id: entity.id,
          order_id: entity.order_id,
          amount: entity.amount,
        });

      if (handledAsMembership) {
        return;
      }

      // Order not created through this system, or
      // local persistence failed after order
      // creation — either way it needs eyes on it.
      logger.warn(
        "payment.captured for unknown Razorpay order.",
        {
          razorpayOrderId: entity.order_id,
          razorpayPaymentId: entity.id,
        }
      );
      return;
    }

    // Idempotent: already reconciled.
    if (payment.status === "CAPTURED") {
      return;
    }

    // Amount sanity check against provider truth.
    const expectedPaise = Math.round(
      Number(payment.amount) * 100
    );
    const webhookPaise = Number(entity.amount);

    if (
      Number.isFinite(webhookPaise) &&
      webhookPaise !== expectedPaise
    ) {
      logger.error(
        "payment.captured amount mismatch; flagging for review.",
        {
          paymentId: payment.id,
          expectedPaise,
          webhookPaise,
        }
      );

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId: entity.id,
          recoveryState:
            PaymentRecoveryState.REVIEW_REQUIRED,
        },
      });
      return;
    }

    const maxAttempts = 3;
    let confirmedBookingId: string | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await prisma.$transaction(
          async (tx) => {
            const currentPayment =
              await tx.payment.findUnique({
                where: { id: payment.id },
                include: {
                  booking: {
                    select: {
                      id: true,
                      bookingNumber: true,
                      status: true,
                      createdAt: true,
                      reservationExpiresAt: true,
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

            // Another path already reconciled it.
            if (currentPayment.status === "CAPTURED") {
              return;
            }

            const transactionNow = new Date();
            const booking = currentPayment.booking;
            const reservationExpiresAt =
              booking.reservationExpiresAt ??
              new Date(
                booking.createdAt.getTime() +
                  BOOKING_CONFIG.PAYMENT_HOLD_MINUTES *
                    60 *
                    1000
              );

            const reservationActive =
              booking.status === "PENDING" &&
              transactionNow < reservationExpiresAt;

            if (reservationActive) {
              await tx.payment.update({
                where: { id: currentPayment.id },
                data: {
                  status: "CAPTURED",
                  razorpayPaymentId: entity.id,
                },
              });

              await tx.booking.update({
                where: { id: booking.id },
                data: { status: "CONFIRMED" },
              });

              await tx.bookingStatusHistory.create({
                data: {
                  bookingId: booking.id,
                  fromStatus: "PENDING",
                  toStatus: "CONFIRMED",
                  actorType: "PAYMENT",
                  changedById: null,
                },
              });

              confirmedBookingId = booking.id;
            } else {
              // Money captured but the booking can
              // no longer be confirmed.
              await tx.payment.update({
                where: { id: currentPayment.id },
                data: {
                  status: "CAPTURED",
                  razorpayPaymentId: entity.id,
                  recoveryState:
                    PaymentRecoveryState.REVIEW_REQUIRED,
                },
              });

              if (booking.status === "PENDING") {
                await tx.booking.update({
                  where: { id: booking.id },
                  data: { status: "CANCELLED" },
                });

                await tx.bookingStatusHistory.create({
                  data: {
                    bookingId: booking.id,
                    fromStatus: "PENDING",
                    toStatus: "CANCELLED",
                    actorType: "SYSTEM",
                    changedById: null,
                  },
                });
              }
            }
          },
          {
            isolationLevel:
              Prisma.TransactionIsolationLevel.Serializable,
          }
        );
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
          throw error;
        }
      }
    }

    if (confirmedBookingId) {
      void NotificationService.sendBookingConfirmation(
        confirmedBookingId
      );
    }

    logger.info("Reconciled payment.captured webhook.", {
      paymentId: payment.id,
      razorpayPaymentId: entity.id,
    });
  }

  /**
   * payment.failed
   *
   * Marks the internal payment FAILED so the user
   * can retry checkout (a new order can then be
   * created — see create-order flow).
   */
  private static async handlePaymentFailed(
    entity: RazorpayPaymentEntity | undefined
  ): Promise<void> {
    if (!entity?.id || !entity.order_id) {
      return;
    }

    const payment = await prisma.payment.findFirst({
      where: {
        razorpayOrderId: entity.order_id,
      },
    });

    if (!payment || payment.status !== "PENDING") {
      return;
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        razorpayPaymentId: entity.id,
        failureCode: entity.error_code ?? null,
        failureMessage:
          entity.error_description ?? null,
      },
    });

    logger.info("Marked payment as failed via webhook.", {
      paymentId: payment.id,
      razorpayPaymentId: entity.id,
      failureCode: entity.error_code,
    });
  }
}
