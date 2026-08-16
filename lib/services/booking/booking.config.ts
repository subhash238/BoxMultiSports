/**
 * ==========================================
 * Booking Configuration
 * ==========================================
 */

export const BOOKING_CONFIG = {
  /**
   * Business Hours
   */
  OPENING_TIME: "06:00",

  CLOSING_TIME: "23:00",

  /**
   * Booking Number
   */
  BOOKING_PREFIX: "BMS",

  /**
   * Booking Duration
   * (Minutes)
   */
  MIN_DURATION: 30,

  MAX_DURATION: 600,

  /**
   * Payment Hold
   *
   * A PENDING booking temporarily holds
   * the selected slot while the customer
   * completes Razorpay payment.
   *
   * After 10 minutes, an unpaid PENDING
   * booking should no longer block the slot.
   */
  PAYMENT_HOLD_MINUTES: 10,

  /**
   * Currency
   */
  CURRENCY: "INR",
} as const;