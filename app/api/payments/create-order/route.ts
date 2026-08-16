import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";

import { PaymentService } from "@/lib/services/payment/payment.service";

// ==========================================
// POST - Create Razorpay Order
// ==========================================

export async function POST(
  request: NextRequest
) {
  try {
    // ==========================================
    // Get Current User
    // ==========================================

    const user =
      await getCurrentUser(request);

    // ==========================================
    // Read Request Body
    // ==========================================

    const body =
      await request.json();

    const bookingId =
      body?.bookingId;

    // ==========================================
    // Validate Booking ID
    // ==========================================

    if (
      typeof bookingId !== "string" ||
      !bookingId.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Booking ID is required.",
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
          id: bookingId,
        },

        select: {
          id: true,
          userId: true,
          bookingNumber: true,
          totalAmount: true,
          status: true,
        },
      });

    // ==========================================
    // Booking Not Found
    // ==========================================

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Booking not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // Check Booking Ownership
    // ==========================================

    if (booking.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not authorized to pay for this booking.",
        },
        {
          status: 403,
        }
      );
    }

    // ==========================================
    // Prevent Payment For Cancelled Booking
    // ==========================================

    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cancelled bookings cannot be paid.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // Prevent Payment For Completed Booking
    // ==========================================

    if (booking.status === "COMPLETED") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Completed bookings cannot be paid.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // Create Razorpay Order
    // ==========================================

    const result =
      await PaymentService.createRazorpayOrder(
        booking.id
      );

    // ==========================================
    // Success Response
    // ==========================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Razorpay order created successfully.",

        payment: result.payment,

        order: result.order,
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

    console.error(
      "Create Razorpay order error:",
      error
    );

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