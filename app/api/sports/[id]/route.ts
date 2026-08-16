import { NextRequest, NextResponse } from "next/server";

import {
  updateSportSchema,
} from "@/lib/validators/sport";

import { SportService } from "@/lib/services/sport/sport.service";
import { getCurrentUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";

import { ZodError } from "zod";


interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const sport =
      await SportService.getSportById(
        id
      );

    return NextResponse.json(
      {
        success: true,
        sport,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: error.statusCode,
        }
      );
    }

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}


export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Authentication
    const user = await getCurrentUser(request);

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied.",
        },
        {
          status: 403,
        }
      );
    }

    // Route parameter
    const { id } = await params;

    // Request body
    const body = await request.json();

    // Validate
    const data =
      updateSportSchema.parse(body);

    // Update
    const sport =
      await SportService.updateSport(
        id,
        data
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Sport updated successfully.",
        sport,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: error.statusCode,
        }
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed.",
          errors: error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);

    // Allow only ADMIN
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied.",
        },
        { status: 403 }
      );
    }

    // Get sport id
    const { id } = await params;

    // Delete sport
    await SportService.deleteSport(id);

    return NextResponse.json(
      {
        success: true,
        message: "Sport deleted successfully.",
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

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}