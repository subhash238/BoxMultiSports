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
    .min(1, "Please enter a valid full name.")
    .max(100, "Please enter a valid full name.")
    .regex(
      /^[A-Za-z]/,
      "Please enter a valid full name."
    ),

  email: z
    .string()
    .trim()
    .min(1, "Please enter a valid email address.")
    .max(255, "Please enter a valid email address.")
    .email("Please enter a valid email address."),

  mobile: z
    .string()
    .trim()
    .length(10, "Mobile number must be exactly 10 digits.")
    .regex(
      /^[6-9]\d{9}$/,
      "Please enter a valid Indian mobile number."
    ),

  specialRequest: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .refine(
      (value) =>
        !value || value.split(/\s+/).length <= 500,
      "Special Request cannot exceed 500 words."
    )
    .optional(),
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
