import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

import { SPORT_MESSAGES } from "./sport.responses";

export class SportDeleteService {
  /**
   * ==========================================
   * Delete Sport
   * ==========================================
   */
  static async delete(
    sportId: string
  ) {
    // -----------------------------------------
    // Find Existing Sport
    // -----------------------------------------

    const sport =
      await prisma.sport.findUnique({
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
    // Check Existing Bookings
    // -----------------------------------------

    const booking =
      await prisma.booking.findFirst({
        where: {
          sportId,
        },
      });

    if (booking) {
      throw new AppError(
        SPORT_MESSAGES.SPORT_HAS_BOOKINGS,
        409
      );
    }

    // -----------------------------------------
    // Delete Sport
    // -----------------------------------------

    return prisma.sport.delete({
      where: {
        id: sportId,
      },
    });
  }
}