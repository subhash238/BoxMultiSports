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
      },
    });
  }
}