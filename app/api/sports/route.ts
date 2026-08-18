import { NextRequest, NextResponse } from "next/server";
import { createSportSchema } from "@/lib/validators/sport";
import { SportService } from "@/lib/services/sport/sport.service";
import { getCurrentUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";

export async function POST(request: NextRequest) 
{
  try {
    // Check authentication
    const user = await getCurrentUser(request);

    // Allow only admins
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied.",
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request
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

    // Create sport
    const sport = await SportService.createSport(result.data);

    return NextResponse.json(
      {
        success: true,
        message: "Sport created successfully.",
        sport,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    const sports = await SportService.getAllSports();

    return NextResponse.json(
      {
        success: true,
        sports,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
