import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";

import { BookingService } from "@/lib/services/booking/booking.service";

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const user =
      await getCurrentUser(request);

    const { id } =
      await params;

    const booking =
      await BookingService.cancelBooking(
        user.id,
        id
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Booking cancelled successfully.",
        data: booking,
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

    console.error("========== CANCEL ERROR ==========");
console.dir(error, { depth: null });
console.error("==================================");

return NextResponse.json(
  {
    success: false,
    message:
      error instanceof Error
        ? error.message
        : String(error),
  },
  {
    status: 500,
  }
);
  }
}