import {
  Payment,
  PaymentStatus,
} from "@prisma/client";

/**
 * ==========================================
 * Payment Service Types
 * ==========================================
 */

/**
 * Payment creation input
 */
export interface CreatePaymentInput {
  bookingId: string;
  amount: number;
  currency?: string;
}

/**
 * Payment update input
 */
export interface UpdatePaymentInput {
  status?: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  failureCode?: string;
  failureMessage?: string;
}

/**
 * Payment with booking information
 */
export type PaymentWithBooking = Payment & {
  booking: {
    id: string;
    bookingNumber: string;
    bookingDate: Date;
    startTime: Date;
    endTime: Date;
    duration: number;
    totalAmount: unknown;
    status: string;
  };
};