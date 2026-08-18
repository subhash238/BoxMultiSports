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

  fullName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters.")
    .max(100, "Full name must be at most 100 characters."),

  mobile: z
    .string()
    .trim()
    .length(10, "Mobile number must be exactly 10 digits.")
    .regex(
      /^[6-9]\d{9}$/,
      "Please enter a valid Indian mobile number."
    ),
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
