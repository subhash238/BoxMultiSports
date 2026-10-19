import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * Generic error → HTTP mapping for API route handlers.
 */
export function apiErrorResponse(error: unknown, scope = "api") {
  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: error.issues[0]?.message ?? "Validation failed.",
        errors: error.flatten(),
      },
      { status: 400 }
    );
  }

  logger.error(`Unhandled ${scope} route error.`, {
    error:
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null
          ? JSON.stringify(error)
          : String(error),
  });

  return NextResponse.json(
    { success: false, message: "Internal Server Error." },
    { status: 500 }
  );
}
