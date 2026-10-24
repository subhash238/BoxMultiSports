import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    // Guest (no/invalid session) is a normal state, not an error:
    // answer 200 with user: null so browsers don't log 401 noise.
    if (error instanceof AppError && error.statusCode === 401) {
      return NextResponse.json({
        success: true,
        user: null,
      });
    }

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
