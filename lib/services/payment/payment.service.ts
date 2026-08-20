import {
  Payment,
  PaymentRecoveryState,
  PaymentStatus,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { razorpay } from "@/lib/razorpay";
import crypto from "crypto";

import {
  CreatePaymentInput,
  UpdatePaymentInput,
} from "./payment.types";

import { PAYMENT_MESSAGES } from "./payment.responses";
import {
  verifyGuestPaymentToken,
} from "./guest-payment-token";

import { BOOKING_CONFIG } from "../booking/booking.config";

type CreateOrderAuthorization =
  | {
      type: "AUTHENTICATED";
      userId: string;
    }
  | {
      type: "GUEST";
      guestPaymentToken: string;
    };

type VerifyPaymentAuthorization =
  | {
      type: "AUTHENTICATED";
      userId: string;
    }
  | {
      type: "GUEST";
      guestPaymentToken: string;
    };

export class PaymentService {
  /**
   * ==========================================
   * Create Payment
   * ==========================================
   *
   * D5.1.3 Foundation
   *
   * Creates the internal payment record.
   */
  static async createPayment(
    data: CreatePaymentInput
  ): Promise<Payment> {
    // -----------------------------------------
    // Validate Amount
    // -----------------------------------------

    if (
      !Number.isFinite(data.amount) ||
      data.amount <= 0
    ) {
      throw new AppError(
        PAYMENT_MESSAGES.INVALID_PAYMENT_AMOUNT,
        400
      );
    }

    // -----------------------------------------
    // Find Booking
    // -----------------------------------------

    const booking =
      await prisma.booking.findUnique({
        where: {
          id: data.bookingId,
        },

        select: {
          id: true,
          totalAmount: true,
          status: true,
        },
      });

    // -----------------------------------------
    // Booking Not Found
    // -----------------------------------------

    if (!booking) {
      throw new AppError(
        PAYMENT_MESSAGES.BOOKING_NOT_FOUND,
        404
      );
    }

    // -----------------------------------------
    // Check Existing Payment
    // -----------------------------------------

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

    // -----------------------------------------
    // Create Payment
    // -----------------------------------------

    const payment =
      await prisma.payment.create({
        data: {
          bookingId:
            data.bookingId,

          amount:
            data.amount,

          currency:
            data.currency ?? "INR",

          status: "PENDING",
        },
      });

    return payment;
  }

  /**
   * ==========================================
   * Create Razorpay Order
   * ==========================================
   *
   * D5.2.3
   *
   * Creates a Razorpay order and connects it
   * to the internal payment record.
   */
  static async createRazorpayOrder(
    bookingId: string,
    authorization: CreateOrderAuthorization
  ) {
    // -----------------------------------------
    // Find Booking
    // -----------------------------------------

    const booking =
      await prisma.booking.findUnique({
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

    // -----------------------------------------
    // Booking Not Found
    // -----------------------------------------

    if (!booking) {
      throw new AppError(
        PAYMENT_MESSAGES.BOOKING_NOT_FOUND,
        404
      );
    }

    // -----------------------------------------
    // Validate Booking Status
    // -----------------------------------------

    if (
      booking.status !==
      "PENDING"
    ) {
      throw new AppError(
        `Payment cannot be created for a booking with status ${booking.status}.`,
        400
      );
    }

    const now = new Date();

    // -----------------------------------------
    // Authorize Booking Payment
    // -----------------------------------------

    if (
      authorization.type ===
      "AUTHENTICATED"
    ) {
      if (
        booking.userId === null ||
        booking.userId !==
          authorization.userId
      ) {
        throw new AppError(
          "You are not authorized to pay for this booking.",
          403
        );
      }
    } else {
      const guestAuthorizationError =
        new AppError(
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

      if (
        now >=
        booking.guestPaymentTokenExpiresAt
      ) {
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
          BOOKING_CONFIG.PAYMENT_HOLD_MINUTES *
            60 *
            1000
      );

    if (now >= reservationExpiresAt) {
      throw new AppError(
        "The reservation for this booking has expired. Please create a new booking.",
        409
      );
    }

    const isGuestAuthorization =
      authorization.type === "GUEST";

    // -----------------------------------------
    // Validate Booking Amount
    // -----------------------------------------

    const amount =
      Number(
        booking.totalAmount
      );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new AppError(
        PAYMENT_MESSAGES.INVALID_PAYMENT_AMOUNT,
        400
      );
    }

    // -----------------------------------------
    // Check Existing Payment
    // -----------------------------------------

    const existingPayment =
      await prisma.payment.findUnique({
        where: {
          bookingId,
        },
      });

    // -----------------------------------------
    // Prevent Duplicate Razorpay Order
    // -----------------------------------------

    if (
      existingPayment?.razorpayOrderId
    ) {
      throw new AppError(
        "Razorpay order already exists for this booking.",
        409
      );
    }

    // -----------------------------------------
    // Convert INR To Paise
    // -----------------------------------------

    const amountInPaise =
      Math.round(
        amount * 100
      );

    // -----------------------------------------
    // Create Razorpay Order
    // -----------------------------------------

    const razorpayOrder =
      await razorpay.orders.create({
        amount:
          amountInPaise,

        currency:
          "INR",

        receipt:
          booking.bookingNumber,

        notes: {
          bookingId:
            booking.id,

          bookingNumber:
            booking.bookingNumber,
        },
      });

    const checkoutStartedAt = new Date();
    const checkoutExpiresAt = new Date(
      checkoutStartedAt.getTime() +
        BOOKING_CONFIG.PAYMENT_CHECKOUT_HOLD_MINUTES *
          60 *
          1000
    );

    const guestAuthorizedAt =
      isGuestAuthorization
        ? checkoutStartedAt
        : null;

    // -----------------------------------------
    // Create / Update Internal Payment
    // -----------------------------------------

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

          if (currentPayment?.razorpayOrderId) {
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
                  razorpayOrderId:
                    razorpayOrder.id,
                  guestAuthorizedAt,
                },
              })
            : await tx.payment.create({
                data: {
                  bookingId:
                    booking.id,
                  amount:
                    booking.totalAmount,
                  currency:
                    "INR",
                  status:
                    "PENDING",
                  razorpayOrderId:
                    razorpayOrder.id,
                  guestAuthorizedAt,
                },
              });

          await tx.booking.update({
            where: {
              id: currentBooking.id,
            },
            data: {
              reservationExpiresAt:
                checkoutExpiresAt,
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
      console.error(
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

    // -----------------------------------------
    // Return Order Information
    // -----------------------------------------

    return {
      payment,

      order: {
        id:
          razorpayOrder.id,

        amount:
          razorpayOrder.amount,

        currency:
          razorpayOrder.currency,

        receipt:
          razorpayOrder.receipt,
      },
    };
  }

  /**
   * ==========================================
   * Verify Razorpay Signature
   * ==========================================
   *
   * D5.2.4
   *
   * Verifies that the Razorpay response has
   * not been modified.
   */
  static verifyRazorpaySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): boolean {
    // -----------------------------------------
    // Validate Input
    // -----------------------------------------

    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return false;
    }

    // -----------------------------------------
    // Get Razorpay Secret
    // -----------------------------------------

    const razorpaySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!razorpaySecret) {
      throw new AppError(
        "Razorpay secret key is not configured.",
        500
      );
    }

    // -----------------------------------------
    // Create Signature Payload
    // -----------------------------------------

    const payload =
      `${razorpayOrderId}|${razorpayPaymentId}`;

    // -----------------------------------------
    // Generate Expected Signature
    // -----------------------------------------

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          razorpaySecret
        )
        .update(payload)
        .digest("hex");

    // -----------------------------------------
    // Compare Signatures Safely
    // -----------------------------------------

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "utf8"
      );

    const receivedBuffer =
      Buffer.from(
        razorpaySignature,
        "utf8"
      );

    if (
      expectedBuffer.length !==
      receivedBuffer.length
    ) {
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
   * ==========================================
   * Verify Razorpay Payment
   * ==========================================
   *
   * D5.2.6
   *
   * 1. Verify Razorpay signature
   * 2. Verify booking ownership
   * 3. Verify payment hold has not expired
   * 4. Mark payment as CAPTURED
   * 5. Confirm booking
   * 6. Record booking status history
   *
   * All database changes happen inside one
   * transaction.
   *
   * Payment hold:
   *
   * PENDING booking
   *      ↓
   * within 10 minutes → payment allowed
   *      ↓
   * CONFIRMED
   *
   * Older than 10 minutes:
   *
   * PENDING booking
   *      ↓
   * hold expired
   *      ↓
   * CANCELLED
   *
   * A provider-captured payment for an expired
   * booking is recorded as CAPTURED and marked
   * for recovery review without confirming the
   * booking.
   * ==========================================
   */
  static async verifyRazorpayPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    authorization: VerifyPaymentAuthorization
  ) {
    // -----------------------------------------
    // Validate Input
    // -----------------------------------------

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

    // -----------------------------------------
    // Find Payment + Booking
    // -----------------------------------------

    const payment =
      await prisma.payment.findFirst({
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

    // -----------------------------------------
    // Payment Not Found
    // -----------------------------------------

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
      if (
        authorization.type ===
        "AUTHENTICATED"
      ) {
        if (
          paymentRecord.booking.userId ===
            null ||
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
        paymentRecord.booking.userId !==
          null ||
        paymentRecord.guestAuthorizedAt ===
          null ||
        !paymentRecord.booking
          .guestPaymentTokenHash ||
        (!allowExpiredGuestToken &&
          (!paymentRecord.booking
            .guestPaymentTokenExpiresAt ||
            new Date() >=
              paymentRecord.booking
                .guestPaymentTokenExpiresAt)) ||
        !verifyGuestPaymentToken(
          authorization.guestPaymentToken,
          paymentRecord.booking
            .guestPaymentTokenHash
        )
      ) {
        throw new AppError(
          "You are not authorized to verify this payment.",
          403
        );
      }
    };

    if (
      payment.status ===
      "CAPTURED"
    ) {
      authorizePaymentVerification(
        payment,
        payment.booking.status ===
          "CONFIRMED"
      );

      if (
        typeof payment.razorpayOrderId !==
          "string" ||
        !payment.razorpayOrderId ||
        typeof payment.razorpayPaymentId !==
          "string" ||
        !payment.razorpayPaymentId ||
        payment.razorpayOrderId !==
          razorpayOrderId ||
        payment.razorpayPaymentId !==
          razorpayPaymentId
      ) {
        throw new AppError(
          "Payment verification failed.",
          400
        );
      }

      const signatureValid =
        this.verifyRazorpaySignature(
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

      if (
        payment.booking.status !==
        "CONFIRMED"
      ) {
        throw new AppError(
          "Payment verification failed.",
          400
        );
      }

      return {
        payment,

        booking:
          payment.booking,
      };
    }

    authorizePaymentVerification(
      payment
    );

    // -----------------------------------------
    // Verify Razorpay Signature
    // -----------------------------------------

    const signatureValid =
      this.verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

    // -----------------------------------------
    // Invalid Signature
    // -----------------------------------------

    if (!signatureValid) {
      throw new AppError(
        "Invalid Razorpay payment signature.",
        400
      );
    }

    let razorpayPayment;

    try {
      razorpayPayment =
        await razorpay.payments.fetch(
          razorpayPaymentId
        );
    } catch {
      throw new AppError(
        "Payment verification failed.",
        400
      );
    }

    const expectedAmountInPaise =
      Math.round(
        Number(payment.amount) * 100
      );

    const razorpayAmountInPaise =
      Number(
        razorpayPayment.amount
      );

    const reconciliationFailed =
      !razorpayPayment.id ||
      razorpayPayment.id !==
        razorpayPaymentId ||
      (payment.razorpayPaymentId !==
        null &&
        payment.razorpayPaymentId !==
          razorpayPaymentId) ||
      !payment.razorpayOrderId ||
      payment.razorpayOrderId !==
        razorpayOrderId ||
      razorpayPayment.order_id !==
        razorpayOrderId ||
      razorpayPayment.order_id !==
        payment.razorpayOrderId ||
      !Number.isFinite(
        expectedAmountInPaise
      ) ||
      !Number.isFinite(
        razorpayAmountInPaise
      ) ||
      razorpayAmountInPaise !==
        expectedAmountInPaise ||
      payment.currency !== "INR" ||
      razorpayPayment.currency !==
        payment.currency ||
      razorpayPayment.status !==
        "captured" ||
      razorpayPayment.captured !==
        true;

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
          // ---------------------------------------
          // Re-check Payment
          // ---------------------------------------

          const currentPayment =
            await tx.payment.findUnique({
              where: {
                id:
                  payment.id,
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
            currentPayment
          );

          // ---------------------------------------
          // Already Captured
          // ---------------------------------------

          if (
            currentPayment.status ===
            "CAPTURED"
          ) {
            if (
              currentPayment.razorpayOrderId !==
                razorpayOrderId ||
              currentPayment.razorpayPaymentId !==
                razorpayPaymentId ||
              currentPayment.booking.status !==
                "CONFIRMED"
            ) {
              throw new AppError(
                "Payment verification failed.",
                400
              );
            }

            return {
              payment:
                currentPayment,

              booking:
                currentPayment.booking,
            };
          }

          // ---------------------------------------
          // Validate Booking Status
          // ---------------------------------------

          if (
            currentPayment.booking.status !==
            "PENDING"
          ) {
            throw new AppError(
              `Payment cannot confirm a booking with status ${currentPayment.booking.status}.`,
              400
            );
          }

          // ---------------------------------------
          // Check Reservation Ownership
          // ---------------------------------------
          //
          // reservationExpiresAt is authoritative.
          // Historical null values temporarily use
          // createdAt plus the initial payment hold.
          // ---------------------------------------

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
            // -------------------------------------
            // Expired Reservation
            // -------------------------------------
            //
            // The booking must not become
            // CONFIRMED after its reservation expires.
            //
            // We cancel the booking so the slot
            // becomes available again.
            //
            // Razorpay has already captured the
            // money, so persist that provider truth
            // and flag the payment for refund review.
            // -------------------------------------

            const capturedPayment =
              await tx.payment.update({
                where: {
                  id:
                    currentPayment.id,
                },

                data: {
                  status:
                    "CAPTURED",

                  razorpayPaymentId:
                    razorpayPaymentId,

                  razorpaySignature:
                    razorpaySignature,

                  recoveryState:
                    PaymentRecoveryState.REVIEW_REQUIRED,
                },
              });

            const cancelledBooking =
              await tx.booking.update({
                where: {
                  id:
                    currentPayment.booking.id,
                },

                data: {
                  status:
                    "CANCELLED",

                  guestPaymentTokenHash:
                    null,

                  guestPaymentTokenExpiresAt:
                    null,
                },

                select: {
                  id: true,
                  userId: true,
                  bookingNumber: true,
                  status: true,
                  createdAt: true,
                },
              });

            // -------------------------------------
            // Record Status History
            // -------------------------------------

            await tx.bookingStatusHistory.create({
              data: {
                bookingId:
                  currentPayment.booking.id,

                fromStatus:
                  "PENDING",

                toStatus:
                  "CANCELLED",

                actorType:
                  "SYSTEM",

                changedById:
                  null,
              },
            });

            return {
              type:
                "EXPIRED" as const,

              payment:
                capturedPayment,

              booking:
                cancelledBooking,
            };
          }

          // ---------------------------------------
          // Update Payment
          // ---------------------------------------

          const updatedPayment =
            await tx.payment.update({
              where: {
                id:
                  currentPayment.id,
              },

              data: {
                status:
                  "CAPTURED",

                razorpayPaymentId:
                  razorpayPaymentId,

                razorpaySignature:
                  razorpaySignature,
              },
            });

          // ---------------------------------------
          // Confirm Booking
          // ---------------------------------------

          const updatedBooking =
            await tx.booking.update({
              where: {
                id:
                  currentPayment.booking.id,
              },

              data: {
                status:
                  "CONFIRMED",
              },

              select: {
                id: true,
                userId: true,
                bookingNumber: true,
                status: true,
                createdAt: true,
              },
            });

          // ---------------------------------------
          // Record Status History
          // ---------------------------------------

          await tx.bookingStatusHistory.create({
            data: {
              bookingId:
                currentPayment.booking.id,

              fromStatus:
                "PENDING",

              toStatus:
                "CONFIRMED",

              actorType:
                "PAYMENT",

              changedById:
                null,
            },
          });

          // ---------------------------------------
          // Return Result
          // ---------------------------------------

          return {
            type:
              "SUCCESS" as const,

            payment:
              updatedPayment,

            booking:
              updatedBooking,
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
    let result: VerificationTransactionResult | null = null;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      try {
        result =
          await runVerificationTransaction();
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

    if (
      result.type ===
      "EXPIRED"
    ) {
      console.warn(
        "Razorpay payment was captured but the booking reservation expired before local confirmation.",
        {
          bookingId: payment.booking.id,
          bookingNumber:
            payment.booking.bookingNumber,
          razorpayOrderId,
          razorpayPaymentId,
          recoveryState:
            PaymentRecoveryState.REVIEW_REQUIRED,
        }
      );

      throw new AppError(
        "Payment was received, but the reservation expired and the booking could not be confirmed. The payment requires refund review. Please contact support with your booking number.",
        409
      );
    }

    return {
      payment:
        result.payment,

      booking:
        result.booking,
    };
  }

  /**
   * ==========================================
   * Get Payment By ID
   * ==========================================
   */
  static async getPaymentById(
    paymentId: string
  ): Promise<Payment> {
    const payment =
      await prisma.payment.findUnique({
        where: {
          id: paymentId,
        },
      });

    if (!payment) {
      throw new AppError(
        PAYMENT_MESSAGES.PAYMENT_NOT_FOUND,
        404
      );
    }

    return payment;
  }

  /**
   * ==========================================
   * Get Payment By Booking ID
   * ==========================================
   */
  static async getPaymentByBookingId(
    bookingId: string
  ): Promise<Payment> {
    const payment =
      await prisma.payment.findUnique({
        where: {
          bookingId,
        },
      });

    if (!payment) {
      throw new AppError(
        PAYMENT_MESSAGES.PAYMENT_NOT_FOUND,
        404
      );
    }

    return payment;
  }

  /**
   * ==========================================
   * Update Payment
   * ==========================================
   *
   * Generic internal update method.
   */
  static async updatePayment(
    paymentId: string,
    data: UpdatePaymentInput
  ): Promise<Payment> {
    // -----------------------------------------
    // Find Payment
    // -----------------------------------------

    const payment =
      await this.getPaymentById(
        paymentId
      );

    // -----------------------------------------
    // Update Payment
    // -----------------------------------------

    const updatedPayment =
      await prisma.payment.update({
        where: {
          id:
            payment.id,
        },

        data: {
          ...(data.status !==
            undefined && {
            status:
              data.status,
          }),

          ...(data.razorpayOrderId !==
            undefined && {
            razorpayOrderId:
              data.razorpayOrderId,
          }),

          ...(data.razorpayPaymentId !==
            undefined && {
            razorpayPaymentId:
              data.razorpayPaymentId,
          }),

          ...(data.razorpaySignature !==
            undefined && {
            razorpaySignature:
              data.razorpaySignature,
          }),

          ...(data.failureCode !==
            undefined && {
            failureCode:
              data.failureCode,
          }),

          ...(data.failureMessage !==
            undefined && {
            failureMessage:
              data.failureMessage,
          }),
        },
      });

    return updatedPayment;
  }

  /**
   * ==========================================
   * Update Payment Status
   * ==========================================
   */
  static async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus
  ): Promise<Payment> {
    // -----------------------------------------
    // Find Payment
    // -----------------------------------------

    const payment =
      await this.getPaymentById(
        paymentId
      );

    // -----------------------------------------
    // Prevent Changes To Final States
    // -----------------------------------------

    if (
      payment.status ===
        "REFUNDED" &&
      status !==
        "REFUNDED"
    ) {
      throw new AppError(
        PAYMENT_MESSAGES.PAYMENT_CANNOT_BE_UPDATED,
        400
      );
    }

    // -----------------------------------------
    // Same Status
    // -----------------------------------------

    if (
      payment.status ===
      status
    ) {
      throw new AppError(
        `Payment is already ${status}.`,
        400
      );
    }

    // -----------------------------------------
    // Update Status
    // -----------------------------------------

    return prisma.payment.update({
      where: {
        id:
          payment.id,
      },

      data: {
        status,
      },
    });
  }

  /**
   * ==========================================
   * Get Payment With Booking
   * ==========================================
   */
  static async getPaymentWithBooking(
    paymentId: string
  ) {
    const payment =
      await prisma.payment.findUnique({
        where: {
          id: paymentId,
        },

        include: {
          booking: {
            select: {
              id: true,
              bookingNumber: true,
              bookingDate: true,
              startTime: true,
              endTime: true,
              duration: true,
              totalAmount: true,
              status: true,
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

    return payment;
  }
}
