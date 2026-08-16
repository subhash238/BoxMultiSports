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

    const updatedSport =
      await prisma.sport.update({
        where: {
          id: sportId,
        },
        data,
      });

    return updatedSport;
  }
}