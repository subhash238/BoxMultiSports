import { z } from "zod";

export const sportPricingItemSchema = z.object({
  // Duration in minutes.
  duration: z.coerce
    .number()
    .int()
    .positive()
    .max(720, "Duration cannot exceed 720 minutes."),

  price: z.coerce
    .number()
    .positive("Price must be greater than zero"),
});

export const createSportSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Sport name must be at least 2 characters")
    .max(100),

  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, {
      message:
        "Slug can contain only lowercase letters, numbers and hyphens.",
    }),

  description: z
    .string()
    .trim()
    .max(500)
    .optional(),

  pricePerHour: z.coerce
    .number()
    .positive("Price must be greater than zero"),

  maxPlayers: z.coerce
    .number()
    .int()
    .positive(),

  imageUrl: z
    .string()
    .trim()
    .max(255)
    .optional(),

  isActive: z
    .boolean()
    .optional(),

  // Duration-based pricing shown on the site and used for bookings.
  pricing: z
    .array(sportPricingItemSchema)
    .max(20)
    .optional()
    .refine(
      (rows) =>
        !rows ||
        new Set(rows.map((r) => r.duration)).size === rows.length,
      { message: "Each duration can only be priced once." }
    ),
});

export type SportPricingItemInput = z.infer<typeof sportPricingItemSchema>;

export const updateSportSchema =
  createSportSchema.partial();

export type CreateSportInput =
  z.infer<typeof createSportSchema>;

export type UpdateSportInput =
  z.infer<typeof updateSportSchema>;