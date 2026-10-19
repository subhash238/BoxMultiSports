import { NextRequest, NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/permissions";
import { updateMembershipStatusSchema } from "@/lib/validators/membership";
import { MembershipService } from "@/lib/services/membership/membership.service";
import { membershipErrorResponse } from "@/lib/services/membership/membership.http";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser(request);

    const { id } = await context.params;

    const { status } = updateMembershipStatusSchema.parse(
      await request.json()
    );

    const membership = await MembershipService.updateStatus(
      id,
      status,
      admin.id
    );

    return NextResponse.json({
      success: true,
      message: `Membership marked ${status}.`,
      membership,
    });
  } catch (error) {
    return membershipErrorResponse(error);
  }
}
