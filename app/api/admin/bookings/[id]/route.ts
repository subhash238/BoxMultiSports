import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

import { BookingService } from "@/lib/services/booking/booking.service";

import { AppError } from "@/lib/errors";

import { BookingStatus } from "@prisma/client";

// ==========================================
// GET - Admin Booking Details
// ==========================================

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // ==========================================
    // Get Current User
    // ==========================================

    const user =
      await getCurrentUser(request);

    // ==========================================
    // Check Admin Permission
    // ==========================================

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

    // ==========================================
    // Get Booking ID
    // ==========================================

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // Find Booking
    // ==========================================

    const booking =
      await prisma.booking.findUnique({
        where: {
          id,
        },

        include: {
          // --------------------------------------
          // Customer Information
          // --------------------------------------

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              mobile: true,
            },
          },

          // --------------------------------------
          // Sport Information
          // --------------------------------------

          sport: {
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrl: true,
              pricePerHour: true,
            },
          },

          // --------------------------------------
          // Booking Status History
          // --------------------------------------

          statusHistory: {
            orderBy: {
              createdAt: "desc",
            },

            include: {
              changedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  mobile: true,
                },
              },
            },
          },
        },
      });

    // ==========================================
    // Booking Not Found
    // ==========================================

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // Success
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        booking,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error.",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// PATCH - Admin Booking Status
// ==========================================

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    // ==========================================
    // Get Current User
    // ==========================================

    const user =
      await getCurrentUser(request);

    // ==========================================
    // Admin Authorization
    // ==========================================

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    // ==========================================
    // Get Booking ID
    // ==========================================

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // Read Request Body
    // ==========================================

    const body =
      await request.json();

    const requestedStatus =
      body?.status;

    // ==========================================
    // Validate Status Value
    // ==========================================

    const validStatuses: BookingStatus[] = [
      "PENDING",
      "CONFIRMED",
      "CANCELLED",
      "COMPLETED",
    ];

    if (
      !validStatuses.includes(
        requestedStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid booking status.",
        },
        {
          status: 400,
        }
      );
    }

    const newStatus =
      requestedStatus as BookingStatus;

    // ==========================================
    // Update Booking Status
    // ==========================================

    const updatedBooking =
      await BookingService.updateBookingStatusAsAdmin(
        id,
        newStatus,
        user.id
      );

    // ==========================================
    // Success Response
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        message:
          `Booking status changed to ${newStatus}.`,
        booking: updatedBooking,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    // ==========================================
    // Application Error
    // ==========================================

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

    // ==========================================
    // Unknown Error
    // ==========================================

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal Server Error.",
      },
      {
        status: 500,
      }
    );
  }
}
