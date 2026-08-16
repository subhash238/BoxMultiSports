/**
 * ==========================================
 * Sport Response Messages
 * ==========================================
 */

export const SPORT_MESSAGES = {
  /**
   * Success
   */
  SPORT_CREATED: "Sport created successfully.",
  SPORT_UPDATED: "Sport updated successfully.",
  SPORT_DELETED: "Sport deleted successfully.",

  /**
   * Errors
   */
  SPORT_NOT_FOUND: "Sport not found.",
  SPORT_ALREADY_EXISTS: "Sport with this name already exists.",
  SPORT_SLUG_ALREADY_EXISTS: "Sport with this slug already exists.",
  SPORT_INACTIVE: "Sport is inactive.",

  /**
   * Generic
   */
  INTERNAL_SERVER_ERROR: "Internal Server Error.",

  SPORT_HAS_BOOKINGS:
  "Cannot delete sport because bookings exist.",
} as const;