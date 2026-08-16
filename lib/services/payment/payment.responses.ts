/**
 * ==========================================
 * Payment Response Messages
 * ==========================================
 */

export const PAYMENT_MESSAGES = {
  PAYMENT_NOT_FOUND: "Payment not found.",

  PAYMENT_ALREADY_EXISTS:
    "Payment already exists for this booking.",

  BOOKING_NOT_FOUND:
    "Booking not found.",

  INVALID_PAYMENT_AMOUNT:
    "Invalid payment amount.",

  INVALID_PAYMENT_STATUS:
    "Invalid payment status.",

  PAYMENT_CANNOT_BE_UPDATED:
    "Payment cannot be updated in its current status.",

  PAYMENT_CREATED:
    "Payment created successfully.",

  PAYMENT_UPDATED:
    "Payment updated successfully.",
} as const;