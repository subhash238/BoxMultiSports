import { NextRequest, NextResponse } from "next/server";

import { AppError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth";
import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { createMembershipSchema } from "@/lib/validators/membership";
import { MembershipService } from "@/lib/services/membership/membership.service";
import { membershipErrorResponse } from "@/lib/services/membership/membership.http";

// ==========================================
// POST - Create Membership (PENDING)
// ==========================================

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit(
      "membership-create",
      getClientIp(request),
      RATE_LIMITS.BOOKING_CREATE
    );

    const user = await getCurrentUser(request).catch((error) => {
      if (
        error instanceof AppError &&
        (error.statusCode === 401 || error.statusCode === 404)
      ) {
        throw new AppError("Please sign in to join a plan.", 401);
      }

      throw error;
    });

    const data = createMembershipSchema.parse(await request.json());

    const result = await MembershipService.createMembership(
      user.id,
      data
    );

    return NextResponse.json(
      {
        success: true,
        message: "Membership created.",
        membership: result.membership,
        paymentToken: result.paymentToken,
      },
      { status: 201 }
    );
  } catch (error) {
    return membershipErrorResponse(error);
  }
}
