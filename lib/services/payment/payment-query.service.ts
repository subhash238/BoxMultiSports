import { Payment, PaymentStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

import { UpdatePaymentInput } from "./payment.types";
import { PAYMENT_MESSAGES } from "./payment.responses";

export class PaymentQueryService {
  static async getPaymentById(
    paymentId: string
  ): Promise<Payment> {
    const payment = await prisma.payment.findUnique({
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

  static async getPaymentByBookingId(
    bookingId: string
  ): Promise<Payment> {
    const payment = await prisma.payment.findUnique({
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
   * Generic internal update method.
   */
  static async updatePayment(
    paymentId: string,
    data: UpdatePaymentInput
  ): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId);

    return prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        ...(data.status !== undefined && {
          status: data.status,
        }),
        ...(data.razorpayOrderId !== undefined && {
          razorpayOrderId: data.razorpayOrderId,
        }),
        ...(data.razorpayPaymentId !== undefined && {
          razorpayPaymentId: data.razorpayPaymentId,
        }),
        ...(data.razorpaySignature !== undefined && {
          razorpaySignature: data.razorpaySignature,
        }),
        ...(data.failureCode !== undefined && {
          failureCode: data.failureCode,
        }),
        ...(data.failureMessage !== undefined && {
          failureMessage: data.failureMessage,
        }),
      },
    });
  }

  static async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus
  ): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId);

    if (
      payment.status === "REFUNDED" &&
      status !== "REFUNDED"
    ) {
      throw new AppError(
        PAYMENT_MESSAGES.PAYMENT_CANNOT_BE_UPDATED,
        400
      );
    }

    if (payment.status === status) {
      throw new AppError(
        `Payment is already ${status}.`,
        400
      );
    }

    return prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status,
      },
    });
  }

  static async getPaymentWithBooking(paymentId: string) {
    const payment = await prisma.payment.findUnique({
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
