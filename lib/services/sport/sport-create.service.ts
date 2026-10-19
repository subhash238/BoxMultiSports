import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

import { CreateSportInput } from "@/lib/validators/sport";

import { SPORT_MESSAGES } from "./sport.responses";

export class SportCreateService {
  /**
   * ==========================================
   * Create Sport
   * ==========================================
   */
  static async create(
    data: CreateSportInput
  ) {
    // -----------------------------------------
    // Duplicate Name
    // -----------------------------------------

    const existingName =
      await prisma.sport.findUnique({
        where: {
          name: data.name,
        },
      });

    if (existingName) {
      throw new AppError(
        SPORT_MESSAGES.SPORT_ALREADY_EXISTS,
        409
      );
    }

    // -----------------------------------------
    // Duplicate Slug
    // -----------------------------------------

    const existingSlug =
      await prisma.sport.findUnique({
        where: {
          slug: data.slug,
        },
      });

    if (existingSlug) {
      throw new AppError(
        SPORT_MESSAGES.SPORT_SLUG_ALREADY_EXISTS,
        409
      );
    }

    // -----------------------------------------
    // Create Sport
    // -----------------------------------------

    const pricingRows =
      data.pricing && data.pricing.length > 0
        ? data.pricing
        : [{ duration: 60, price: data.pricePerHour }];

    return prisma.sport.create({
      data: {
        name: data.name,
        slug: data.slug,
        description:
          data.description ?? null,
        pricePerHour:
          data.pricePerHour,
        maxPlayers:
          data.maxPlayers,
        imageUrl:
          data.imageUrl ?? null,
        isActive:
          data.isActive ?? true,
        pricing: {
          create: pricingRows.map((row) => ({
            duration: row.duration,
            price: row.price,
            isActive: true,
          })),
        },
      },
      include: {
        pricing: {
          orderBy: { duration: "asc" },
        },
      },
    });
  }
}