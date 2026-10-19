import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { PasswordResetService } from "@/lib/services/auth/password-reset.service";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

const schema = z.object({
  token: z.string().min(32).max(128),
  password: z.string().min(6).max(72),
  scope: z.enum(["customer", "admin"]).default("customer"),
});

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit("auth", getClientIp(request), RATE_LIMITS.AUTH);

    const result = schema.safeParse(await request.json());

    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await PasswordResetService.resetPassword(
      result.data.token,
      result.data.password,
      result.data.scope
    );

    return NextResponse.json({
      success: true,
      message: "Password updated. You can now sign in.",
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    logger.error("Reset password failed.", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
