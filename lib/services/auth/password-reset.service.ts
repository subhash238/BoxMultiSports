import crypto from "crypto";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { AppError } from "@/lib/errors";
import type { AuthScope } from "@/lib/auth";
import { NotificationService } from "@/lib/services/notification/email.service";

const TOKEN_TTL_MINUTES = 30;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const RESET_PATHS: Record<AuthScope, string> = {
  customer: "/reset-password",
  admin: "/admin/reset-password",
};

export class PasswordResetService {
  /**
   * Issues a reset token and emails the link. Always resolves
   * (no account enumeration): unknown emails / wrong scope are
   * silently ignored.
   */
  static async requestReset(
    email: string,
    scope: AuthScope,
    baseUrl: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return;
    }

    const isAdmin = user.role === "ADMIN";
    if ((scope === "admin") !== isAdmin) {
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, scope },
      }),
      prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          scope,
          expiresAt,
        },
      }),
    ]);

    const link = `${baseUrl}${RESET_PATHS[scope]}?token=${token}`;

    const emailed = await NotificationService.sendPasswordReset({
      to: user.email,
      name: user.name,
      link,
      scope,
      expiresInMinutes: TOKEN_TTL_MINUTES,
    });

    logger.info("Password reset requested.", {
      userId: user.id,
      scope,
      emailed,
    });
  }

  /**
   * Validates the token and sets the new password.
   * Throws AppError(400) for invalid/expired/used tokens.
   */
  static async resetPassword(
    token: string,
    newPassword: string,
    scope: AuthScope
  ): Promise<void> {
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
    });

    if (
      !record ||
      record.scope !== scope ||
      record.usedAt ||
      record.expiresAt.getTime() < Date.now()
    ) {
      throw new AppError(
        "This reset link is invalid or has expired. Please request a new one.",
        400
      );
    }

    const password = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { password },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: record.userId, id: { not: record.id } },
      }),
    ]);

    logger.info("Password reset completed.", { userId: record.userId, scope });
  }
}
