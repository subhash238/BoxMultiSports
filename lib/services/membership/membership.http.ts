import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * Shared error → HTTP mapping for membership routes.
 */
export function membershipErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    const first = error.issues[0]?.message;

    return NextResponse.json(
      {
        success: false,
        message: first ?? "Validation failed.",
        errors: error.flatten(),
      },
      { status: 400 }
    );
  }

  logger.error("Unhandled membership route error.", {
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
