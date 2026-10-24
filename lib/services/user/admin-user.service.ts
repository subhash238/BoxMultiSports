import { Prisma, Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

interface ListUsersOptions {
  page: number;
  limit: number;
  role?: string;
  search?: string;
}

const userSelect = {
  id: true,
  name: true,
  email: true,
  mobile: true,
  role: true,
  createdAt: true,
  _count: { select: { bookings: true } },
} satisfies Prisma.UserSelect;

export class AdminUserService {
  static async listUsers({ page, limit, role, search }: ListUsersOptions) {
    const where: Prisma.UserWhereInput = {};

    if (role === "ADMIN" || role === "CUSTOMER") {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const membershipCounts = users.length
      ? await prisma.membership.groupBy({
          by: ["userId"],
          where: { userId: { in: users.map((u) => u.id) } },
          _count: { _all: true },
        })
      : [];

    const membershipsByUser = new Map(
      membershipCounts.map((row) => [row.userId, row._count._all])
    );

    return {
      users: users.map(({ _count, ...user }) => ({
        ...user,
        bookingsCount: _count.bookings,
        membershipsCount: membershipsByUser.get(user.id) ?? 0,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  static async updateRole(userId: string, role: Role, actingAdminId: string) {
    if (userId === actingAdminId && role !== "ADMIN") {
      throw new AppError("You cannot remove your own admin access.", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true },
    });

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    if (user.role === "ADMIN" && role !== "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        throw new AppError("At least one admin must remain.", 400);
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, mobile: true, role: true },
    });

    logger.info("User role updated by admin.", {
      userId,
      role,
      actingAdminId,
    });

    return updated;
  }
}
