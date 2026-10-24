import { NextRequest, NextResponse } from "next/server";
import { SportService } from "@/lib/services/sport/sport.service";
import { updateSportSchema } from "@/lib/validators/sport";
import { AppError } from "@/lib/errors";
import { requireAdminUser } from "@/lib/permissions";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// ============================================================
// GET - Get single sport
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check authentication + admin role
    await requireAdminUser(request);

    // Get sport ID
    const { id } = await params;

    // Get sport
    const sport = await SportService.getSportById(id);

    return NextResponse.json(
      {
        success: true,
        sport,
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

// ============================================================
// PUT - Update sport
// ============================================================

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check authentication + admin role
    await requireAdminUser(request);

    // Get sport ID
    const { id } = await params;

    // Parse request body
    const body = await request.json();

    // Validate request
    const result = updateSportSchema.safeParse(body);

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

    // Update sport
    const sport = await SportService.updateSport(
      id,
      result.data
    );

    return NextResponse.json(
      {
        success: true,
        message: "Sport updated successfully.",
        sport,
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

// ============================================================
// DELETE - Delete sport
// ============================================================

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check authentication + admin role
    await requireAdminUser(request);

    // Get sport ID
    const { id } = await params;

    // Delete sport
    const sport = await SportService.deleteSport(id);

    return NextResponse.json(
      {
        success: true,
        message: "Sport deleted successfully.",
        sport,
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
