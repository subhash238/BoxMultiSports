import { Payment, PaymentStatus } from "@prisma/client";

import {
  CreatePaymentInput,
  UpdatePaymentInput,
} from "./payment.types";

import {
  CreateOrderService,
  CreateOrderAuthorization,
} from "./create-order.service";

import {
  VerifyPaymentService,
  VerifyPaymentAuthorization,
} from "./verify-payment.service";

import { PaymentQueryService } from "./payment-query.service";

export type {
  CreateOrderAuthorization,
  VerifyPaymentAuthorization,
};

/**
 * ==========================================
 * Payment Service (Facade)
 * ==========================================
 *
 * Thin facade over the split payment modules:
 *  - create-order.service.ts   (order creation)
 *  - verify-payment.service.ts (checkout verify)
 *  - webhook.service.ts        (server reconcile)
 *  - payment-query.service.ts  (reads / updates)
 *
 * Kept for backward compatibility with existing
 * route imports; new code may import the
 * module classes directly.
 */
export class PaymentService {
  static createPayment(
    data: CreatePaymentInput
  ): Promise<Payment> {
    return CreateOrderService.createPayment(data);
  }

  static createRazorpayOrder(
    bookingId: string,
    authorization: CreateOrderAuthorization
  ) {
    return CreateOrderService.createRazorpayOrder(
      bookingId,
      authorization
    );
  }

  static verifyRazorpaySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): boolean {
    return VerifyPaymentService.verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
  }

  static verifyRazorpayPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    authorization: VerifyPaymentAuthorization
  ) {
    return VerifyPaymentService.verifyRazorpayPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      authorization
    );
  }

  static getPaymentById(
    paymentId: string
  ): Promise<Payment> {
    return PaymentQueryService.getPaymentById(paymentId);
  }

  static getPaymentByBookingId(
    bookingId: string
  ): Promise<Payment> {
    return PaymentQueryService.getPaymentByBookingId(
      bookingId
    );
  }

  static updatePayment(
    paymentId: string,
    data: UpdatePaymentInput
  ): Promise<Payment> {
    return PaymentQueryService.updatePayment(
      paymentId,
      data
    );
  }

  static updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus
  ): Promise<Payment> {
    return PaymentQueryService.updatePaymentStatus(
      paymentId,
      status
    );
  }

  static getPaymentWithBooking(paymentId: string) {
    return PaymentQueryService.getPaymentWithBooking(
      paymentId
    );
  }
}
