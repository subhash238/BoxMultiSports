import { NextRequest, NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/permissions";
import { apiErrorResponse } from "@/lib/api-error";
import { AdminUserService } from "@/lib/services/user/admin-user.service";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser(request);

    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit") ?? 20) || 20)
    );

    const result = await AdminUserService.listUsers({
      page,
      limit,
      role: searchParams.get("role") ?? undefined,
      search: searchParams.get("search")?.trim() || undefined,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return apiErrorResponse(error, "admin users");
  }
}
