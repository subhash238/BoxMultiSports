/**
 * ==========================================
 * Booking Response Messages
 * ==========================================
 */

export const BOOKING_MESSAGES = {
  /**
   * Success
   */
  BOOKING_CREATED:
    "Booking created successfully.",

  BOOKING_CANCELLED:
    "Booking cancelled successfully.",

  /**
   * Sport
   */
  SPORT_NOT_FOUND:
    "Sport not found.",

  SPORT_INACTIVE:
    "Sport is currently unavailable.",

  /**
   * Booking
   */
  BOOKING_NOT_FOUND:
    "Booking not found.",

  BOOKING_ACCESS_DENIED:
    "You are not allowed to access this booking.",

  SLOT_ALREADY_BOOKED:
    "Selected time slot is already booked.",

  BOOKING_ALREADY_CANCELLED:
    "Booking is already cancelled.",

  BOOKING_COMPLETED:
    "Completed bookings cannot be cancelled.",

  /**
   * Date & Time
   */

  CANNOT_CANCEL_STARTED_BOOKING:
  "Booking cannot be cancelled after it has started.",
  
  PAST_DATE:
    "Booking date cannot be in the past.",

  PAST_TIME:
    "Start time cannot be in the past.",

  INVALID_TIME_RANGE:
    "End time must be after start time.",

  BUSINESS_HOURS:
    "Booking must be within business hours.",

  /**
   * System
   */
  BOOKING_FAILED:
    "Unable to create booking.",

  INTERNAL_SERVER_ERROR:
    "Something went wrong.",
} as const;