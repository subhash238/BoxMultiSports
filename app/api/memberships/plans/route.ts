import { NextResponse } from "next/server";

import { MembershipService } from "@/lib/services/membership/membership.service";
import { membershipErrorResponse } from "@/lib/services/membership/membership.http";

export async function GET() {
  try {
    const plans = await MembershipService.listActivePlans();

    return NextResponse.json({ success: true, plans });
  } catch (error) {
    return membershipErrorResponse(error);
  }
}
