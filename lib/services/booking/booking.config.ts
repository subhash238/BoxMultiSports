/**
 * ==========================================
 * Booking Configuration
 * ==========================================
 */

export const MAIN_BOOKING_SPORT_SLUGS = new Set([
  "badminton",
  "cricket",
  "football",
  "net-practice",
  "pickleball",
]);

export const YOGA_ALLOWED_DURATIONS_MINUTES = new Set([
  60,
  90,
  120,
]);

export const BOOKING_CONFIG = {
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
   * Main Sports Operating Hours
   * (Minutes from booking-day midnight, IST)
   */
  MAIN_OPENING_MINUTES_FROM_MIDNIGHT: 5 * 60,

  MAIN_CLOSING_MINUTES_FROM_MIDNIGHT: 24 * 60,

  /**
   * Initial Payment Hold
   *
   * A PENDING booking temporarily holds
   * the selected slot before Razorpay
   * checkout begins.
   *
   * After 10 minutes, an unpaid PENDING
   * booking should no longer block the slot.
   */
  PAYMENT_HOLD_MINUTES: 10,

  /**
   * Checkout Payment Hold
   *
   * Future reservation window measured from
   * successful Razorpay order creation.
   */
  PAYMENT_CHECKOUT_HOLD_MINUTES: 15,

  /**
   * Currency
   */
  CURRENCY: "INR",
} as const;
