import { NextRequest, NextResponse } from "next/server";

import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { verifyMembershipPaymentSchema } from "@/lib/validators/membership";
import { MembershipService } from "@/lib/services/membership/membership.service";
import { membershipErrorResponse } from "@/lib/services/membership/membership.http";

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit("payment", getClientIp(request), RATE_LIMITS.PAYMENT);

    const body = verifyMembershipPaymentSchema.parse(await request.json());

    const membership = await MembershipService.verifyPayment({
      membershipId: body.membershipId,
      paymentToken: body.paymentToken,
      razorpayOrderId: body.razorpay_order_id,
      razorpayPaymentId: body.razorpay_payment_id,
      razorpaySignature: body.razorpay_signature,
    });

    return NextResponse.json({
      success: true,
      message: "Membership activated.",
      membership,
    });
  } catch (error) {
    return membershipErrorResponse(error);
  }
}
