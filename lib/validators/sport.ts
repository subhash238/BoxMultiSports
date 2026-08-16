import { z } from "zod";

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
});

export const updateSportSchema =
  createSportSchema.partial();

export type CreateSportInput =
  z.infer<typeof createSportSchema>;

export type UpdateSportInput =
  z.infer<typeof updateSportSchema>;