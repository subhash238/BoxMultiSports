import { NextRequest, NextResponse } from "next/server";

import { AppError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth";
import { AccountService } from "@/lib/services/account/account.service";
import { logger } from "@/lib/logger";

// ==========================================
// GET - Logged-in customer's bookings + memberships
// ==========================================

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    const [bookings, memberships] = await Promise.all([
      AccountService.getBookings(user),
      AccountService.getMemberships(user),
    ]);

    return NextResponse.json(
      { success: true, user, bookings, memberships },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    logger.error("Account route error.", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}
