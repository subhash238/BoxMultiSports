import { NextRequest, NextResponse } from "next/server";

import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { membershipPaymentSchema } from "@/lib/validators/membership";
import { MembershipService } from "@/lib/services/membership/membership.service";
import { membershipErrorResponse } from "@/lib/services/membership/membership.http";

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit("payment", getClientIp(request), RATE_LIMITS.PAYMENT);

    const { membershipId, paymentToken } = membershipPaymentSchema.parse(
      await request.json()
    );

    const result = await MembershipService.createRazorpayOrder(
      membershipId,
      paymentToken
    );

    return NextResponse.json({ success: true, order: result.order });
  } catch (error) {
    return membershipErrorResponse(error);
  }
}
