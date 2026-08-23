import { NextRequest, NextResponse } from "next/server";

import { AppError } from "@/lib/errors";
import { BookingAvailabilityService } from "@/lib/services/booking/booking-availability.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const sportId = searchParams.get("sportId");
    const bookingDate = searchParams.get("bookingDate");
    const durationValue = searchParams.get("durationMinutes");

    if (!sportId) {
      throw new AppError("Sport ID is required.", 400);
    }

    if (!bookingDate) {
      throw new AppError("Booking date is required.", 400);
    }

    if (!durationValue) {
      throw new AppError("Booking duration is required.", 400);
    }

    const durationMinutes = Number(durationValue);

    if (!Number.isFinite(durationMinutes)) {
      throw new AppError("Booking duration must be a valid number.", 400);
    }

    const result =
      await BookingAvailabilityService.getMainSportAvailability({
        sportId,
        bookingDate,
        durationMinutes,
      });

    return NextResponse.json(
      {
        success: true,
        data: result,
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
