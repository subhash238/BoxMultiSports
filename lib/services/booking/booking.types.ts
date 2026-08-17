import { Sport } from "@prisma/client";

/**
 * ==========================================
 * Booking Time
 * ==========================================
 */

export type BookingTimeResult = {
  bookingDate: Date;
  startDateTime: Date;
  endDateTime: Date;
};

/**
 * ==========================================
 * Booking Pricing
 * ==========================================
 */

export type BookingPricingResult = {
  durationMinutes: number;
  durationHours: number;
  pricePerHour: number;
  totalAmount: number;
};

/**
 * ==========================================
 * Booking Number
 * ==========================================
 */

export type BookingNumberResult = {
  bookingNumber: string;
};

/**
 * ==========================================
 * Booking Conflict
 * ==========================================
 */

export type BookingConflictResult = {
  hasConflict: boolean;
};

/**
 * ==========================================
 * Booking Validation
 * ==========================================
 */

export type BookingValidationResult = {
  sport: Sport;
  bookingTime: BookingTimeResult;
  numberOfPlayers: number;
};

/**
 * ==========================================
 * Complete Booking Context
 * ==========================================
 */

export type CreateBookingContext = {
  userId: string | null;
  sport: Sport;
  bookingTime: BookingTimeResult;
  pricing: BookingPricingResult;
  numberOfPlayers: number;
  customerName: string;
  customerMobile: string;
};

/**
 * ==========================================
 * Booking List Query
 * ==========================================
 */

export type BookingListQuery = {
  page: number;
  limit: number;
  status?: string;
  search?: string;
  dateFilter?: string;
};

/**
 * ==========================================
 * Booking Pagination
 * ==========================================
 */

export type BookingPaginationResult = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/**
 * ==========================================
 * Booking List Result
 * ==========================================
 */

export type BookingListResult = {
  bookings: unknown[];
  pagination: BookingPaginationResult;
};
