import { NextRequest, NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/permissions";
import { apiErrorResponse } from "@/lib/api-error";
import { updateUserRoleSchema } from "@/lib/validators/admin-user";
import { AdminUserService } from "@/lib/services/user/admin-user.service";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser(request);
    const { id } = await context.params;
    const { role } = updateUserRoleSchema.parse(await request.json());

    const user = await AdminUserService.updateRole(id, role, admin.id);

    return NextResponse.json({
      success: true,
      message: `${user.name} is now ${role === "ADMIN" ? "an admin" : "a customer"}.`,
      user,
    });
  } catch (error) {
    return apiErrorResponse(error, "admin users");
  }
}
