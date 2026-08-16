import { z } from "zod";

/**
 * Create Booking Validation
 */
export const createBookingSchema = z.object({
  sportId: z
    .string()
    .min(1, "Sport ID is required."),

  bookingDate: z
    .string()
    .min(1, "Booking date is required."),

  startTime: z
    .string()
    .min(1, "Start time is required."),

  endTime: z
    .string()
    .min(1, "End time is required."),

  numberOfPlayers: z
    .number()
    .int("Number of players must be a whole number.")
    .min(1, "At least 1 player is required."),
});

/**
 * Update Booking Validation
 */
export const updateBookingSchema = z.object({
  bookingDate: z.string().optional(),

  startTime: z.string().optional(),

  endTime: z.string().optional(),
});

/**
 * Types
 */
export type CreateBookingInput =
  z.infer<typeof createBookingSchema>;

export type UpdateBookingInput =
  z.infer<typeof updateBookingSchema>;