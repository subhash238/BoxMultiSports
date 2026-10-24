import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAMES } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const scope =
      request.nextUrl.searchParams.get("scope") === "admin"
        ? "admin"
        : "customer";

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
      timestamp: new Date().toISOString(),
      data: {},
    });

    // Clear authentication cookie
    response.cookies.delete(AUTH_COOKIE_NAMES[scope]);

    // Prevent caching of authentication responses
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );

    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
