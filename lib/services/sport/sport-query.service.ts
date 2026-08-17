import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

import { SPORT_MESSAGES } from "./sport.responses";

export class SportQueryService {
  /**
   * ==========================================
   * Get All Active Sports
   * ==========================================
   */
  static async getAllSports() {
    return prisma.sport.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        pricePerHour: true,
        maxPlayers: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        pricing: {
          where: {
            isActive: true,
          },
          orderBy: {
            duration: "asc",
          },
          select: {
            duration: true,
            price: true,
          },
        },
      },
    });
  }

  /**
   * ==========================================
   * Get Sport By ID
   * ==========================================
   */
  static async getSportById(
    id: string
  ) {
    const sport =
      await prisma.sport.findUnique({
        where: {
          id,
        },
      });

    if (!sport) {
      throw new AppError(
        SPORT_MESSAGES.SPORT_NOT_FOUND,
        404
      );
    }

    return sport;
  }

  /**
   * ==========================================
   * Get Sport By Slug
   * ==========================================
   */
  static async getSportBySlug(
    slug: string
  ) {
    const sport =
      await prisma.sport.findFirst({
        where: {
          slug,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          pricePerHour: true,
          maxPlayers: true,
          imageUrl: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    if (!sport) {
      throw new AppError(
        SPORT_MESSAGES.SPORT_NOT_FOUND,
        404
      );
    }

    return sport;
  }
}
