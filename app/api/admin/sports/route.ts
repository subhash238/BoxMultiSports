import { NextRequest, NextResponse } from "next/server";

import { SportService } from "@/lib/services/sport/sport.service";
import { createSportSchema } from "@/lib/validators/sport";
import { AppError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth";

// ==========================================
// POST - Create Sport
// ==========================================

export async function POST(request: NextRequest) {
  try {
    // -----------------------------------------
    // Check authentication
    // -----------------------------------------

    const user = await getCurrentUser(request);

    // -----------------------------------------
    // Allow only admins
    // -----------------------------------------

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied.",
        },
        { status: 403 }
      );
    }

    // -----------------------------------------
    // Read request body
    // -----------------------------------------

    const body = await request.json();

    // -----------------------------------------
    // Validate request
    // -----------------------------------------

    const result = createSportSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Create sport
    // -----------------------------------------

    const sport = await SportService.createSport(
      result.data
    );

    // -----------------------------------------
    // Success
    // -----------------------------------------

    return NextResponse.json(
      {
        success: true,
        message: "Sport created successfully.",
        sport,
      },
      { status: 201 }
    );
  } catch (error) {
    // -----------------------------------------
    // Known application error
    // -----------------------------------------

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    // -----------------------------------------
    // Unknown error
    // -----------------------------------------

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
