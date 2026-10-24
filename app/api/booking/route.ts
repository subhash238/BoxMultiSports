import { NextRequest, NextResponse } from "next/server";

import { BookingService } from "@/lib/services/booking/booking.service";
import { AppError } from "@/lib/errors";
import { createBookingSchema } from "@/lib/validators/booking";
import { getCurrentUser } from "@/lib/auth";
import { requireAdminUser } from "@/lib/permissions";
import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { ZodError } from "zod";

// ==========================================
// POST - Create Booking
// ==========================================

export async function POST(request: NextRequest) {
  try {
    // -----------------------------------------
    // Rate Limiting
    // -----------------------------------------

    enforceRateLimit(
      "booking-create",
      getClientIp(request),
      RATE_LIMITS.BOOKING_CREATE
    );

    // -----------------------------------------
    // Authentication
    // -----------------------------------------

    const user = await getCurrentUser(request).catch((error) => {
      if (
        error instanceof AppError &&
        (error.statusCode === 401 || error.statusCode === 404)
      ) {
        throw new AppError("Please sign in to book.", 401);
      }

      throw error;
    });

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
      user.id,
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
      paymentMethod: booking.paymentMethod,
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

    await requireAdminUser(request);

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
