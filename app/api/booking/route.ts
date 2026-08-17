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
    // -----------------------------------------
    // Authentication
    // -----------------------------------------

    const authToken =
      request.cookies.get("auth_token")?.value;

    const user = authToken
      ? await getCurrentUser(request)
      : null;

    // -----------------------------------------
    // Read request body
    // -----------------------------------------

    const body = await request.json();

    // -----------------------------------------
    // Validate request
    // -----------------------------------------

    const data = createBookingSchema.parse(body);

    // -----------------------------------------
    // Create booking
    // -----------------------------------------

    const result = await BookingService.createBooking(
      user?.id ?? null,
      data
    );

    const booking = result.booking;

    const publicBooking = {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      duration: booking.duration,
      totalAmount: booking.totalAmount,
      status: booking.status,
    };

    // -----------------------------------------
    // Success
    // -----------------------------------------

    return NextResponse.json(
      {
        success: true,
        message: "Booking created successfully.",
        data: {
          booking: publicBooking,
          guestPaymentToken: result.guestPaymentToken,
        },
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

    console.error(
      "Create booking API error:",
      error
    );

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

    // -----------------------------------------
    // Get ALL bookings for Admin
    // -----------------------------------------

    const result =
      await BookingService.getAdminBookings({
        page,
        limit,
        status,
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

    console.error(
      "Admin booking list API error:",
      error
    );

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
