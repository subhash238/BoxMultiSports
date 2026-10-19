import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { PasswordResetService } from "@/lib/services/auth/password-reset.service";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

const schema = z.object({
  email: z.email(),
  scope: z.enum(["customer", "admin"]).default("customer"),
});

function getBaseUrl(request: NextRequest): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, "");
  }

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");

  return host ? `${proto}://${host}` : request.nextUrl.origin;
}

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

    await PasswordResetService.requestReset(
      result.data.email,
      result.data.scope,
      getBaseUrl(request)
    );

    return NextResponse.json({
      success: true,
      message:
        "If an account exists for that email, a reset link has been sent.",
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    logger.error("Forgot password failed.", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
