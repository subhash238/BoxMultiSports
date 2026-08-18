import { NextRequest, NextResponse } from "next/server";

import { BookingService } from "@/lib/services/booking/booking.service";
import { AppError } from "@/lib/errors";
import { createBookingSchema } from "@/lib/validators/booking";
import { getCurrentUser } from "@/lib/auth";
import { ZodError } from "zod";

// ==========================================
// POST - Create Booking
// ==========================================

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    const body = await request.json();

    const data = createBookingSchema.parse(body);

    const booking = await BookingService.createBooking(
      user.id,
      data
    );

    return NextResponse.json(
      {
        success: true,
        message: "Booking created successfully.",
        data: booking,
      },
      {
        status: 201,
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

// ==========================================
// GET - Admin Booking List
// ==========================================

export async function GET(request: NextRequest) {
  try {
    // -----------------------------------------
    // Authentication
    // -----------------------------------------

    const user = await getCurrentUser(request);

    // -----------------------------------------
    // Admin Authorization
    // -----------------------------------------

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

    // -----------------------------------------
    // Query Parameters
    // -----------------------------------------

    const { searchParams } = new URL(
      request.url
    );

    const page = Math.max(
      1,
      Number(searchParams.get("page") ?? 1)
    );

    const limit = Math.min(
      50,
      Math.max(
        1,
        Number(searchParams.get("limit") ?? 10)
      )
    );

    const status =
      searchParams.get("status") ?? undefined;

      const search =
  searchParams.get("search")?.trim() ||
  undefined;
  const dateFilter =
  searchParams.get("dateFilter") ?? undefined;
    // -----------------------------------------
    // Get All Bookings
    // -----------------------------------------

    const result =
      await BookingService.getAdminBookings({
        page,
        limit,
        status,
        search,
        dateFilter,
      });

    // -----------------------------------------
    // Success
    // -----------------------------------------

    return NextResponse.json(
      {
        success: true,
        ...result,
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
