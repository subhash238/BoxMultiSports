import { NextResponse } from "next/server";

import { SportService } from "@/lib/services/sport/sport.service";
import { AppError } from "@/lib/errors";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { slug } = await params;

    const sport =
      await SportService.getSportBySlug(
        slug
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