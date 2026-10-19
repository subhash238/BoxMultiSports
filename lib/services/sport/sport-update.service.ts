import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { UpdateSportInput } from "@/lib/validators/sport";

import { SPORT_MESSAGES } from "./sport.responses";

export class SportUpdateService {
  /**
   * ==========================================
   * Update Sport
   * ==========================================
   */
  static async update(
    sportId: string,
    data: UpdateSportInput
  ) {
    // -----------------------------------------
    // Find Existing Sport
    // -----------------------------------------

    const sport = await prisma.sport.findUnique({
      where: {
        id: sportId,
      },
    });

    if (!sport) {
      throw new AppError(
        SPORT_MESSAGES.SPORT_NOT_FOUND,
        404
      );
    }

    // -----------------------------------------
    // Duplicate Name Check
    // -----------------------------------------

    if (
      data.name &&
      data.name !== sport.name
    ) {
      const existingSport =
        await prisma.sport.findFirst({
          where: {
            name: data.name,
            NOT: {
              id: sportId,
            },
          },
        });

      if (existingSport) {
        throw new AppError(
          SPORT_MESSAGES.SPORT_ALREADY_EXISTS,
          400
        );
      }
    }

    // -----------------------------------------
    // Duplicate Slug Check
    // -----------------------------------------

    if (
      data.slug &&
      data.slug !== sport.slug
    ) {
      const existingSport =
        await prisma.sport.findFirst({
          where: {
            slug: data.slug,
            NOT: {
              id: sportId,
            },
          },
        });

      if (existingSport) {
        throw new AppError(
          SPORT_MESSAGES.SPORT_SLUG_ALREADY_EXISTS,
          400
        );
      }
    }

    // -----------------------------------------
    // Update Sport
    // -----------------------------------------

    const { pricing, ...sportData } = data;

    if (!pricing) {
      return prisma.sport.update({
        where: {
          id: sportId,
        },
        data: sportData,
        include: {
          pricing: {
            where: { isActive: true },
            orderBy: { duration: "asc" },
          },
        },
      });
    }

    // Keep the legacy pricePerHour in sync with the 1-hour (or cheapest) row
    // so "Starting ₹X / hour" on the site always reflects the pricing table.
    const hourRow =
      pricing.find((row) => row.duration === 60) ??
      [...pricing].sort((a, b) => a.price - b.price)[0];

    const durations = pricing.map((row) => row.duration);

    return prisma.$transaction(async (tx) => {
      await tx.sportPricing.deleteMany({
        where: {
          sportId,
          duration: { notIn: durations },
        },
      });

      for (const row of pricing) {
        await tx.sportPricing.upsert({
          where: {
            sportId_duration: {
              sportId,
              duration: row.duration,
            },
          },
          update: {
            price: row.price,
            isActive: true,
          },
          create: {
            sportId,
            duration: row.duration,
            price: row.price,
            isActive: true,
          },
        });
      }

      return tx.sport.update({
        where: {
          id: sportId,
        },
        data: {
          ...sportData,
          pricePerHour:
            sportData.pricePerHour ?? hourRow?.price ?? sport.pricePerHour,
        },
        include: {
          pricing: {
            where: { isActive: true },
            orderBy: { duration: "asc" },
          },
        },
      });
    });
  }
}