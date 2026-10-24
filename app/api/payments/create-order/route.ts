import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

import { PaymentService } from "@/lib/services/payment/payment.service";

// ==========================================
// POST - Create Razorpay Order
// ==========================================

export async function POST(
  request: NextRequest
) {
  try {
    // ==========================================
    // Read Request Body
    // ==========================================

    enforceRateLimit(
      "payment",
      getClientIp(request),
      RATE_LIMITS.PAYMENT
    );

    const body =
      await request.json();

    const bookingId =
      body?.bookingId;

    const guestPaymentToken =
      body?.guestPaymentToken;

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

    let authorization;

    if (booking.userId !== null) {
      // ========================================
      // Authenticated Booking Authorization
      // ========================================

      const user =
        await getCurrentUser(request);

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

      authorization = {
        type: "AUTHENTICATED" as const,
        userId: user.id,
      };
    } else {
      // ========================================
      // Guest Booking Authorization
      // ========================================

      if (
        typeof guestPaymentToken !==
          "string" ||
        !guestPaymentToken.trim()
      ) {
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

      authorization = {
        type: "GUEST" as const,
        guestPaymentToken,
      };
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
        booking.id,
        authorization
      );

    // ==========================================
    // Success Response
    // ==========================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Razorpay order created successfully.",

        payment: {
          status:
            result.payment.status,
        },

        order: {
          id:
            result.order.id,

          amount:
            result.order.amount,

          currency:
            result.order.currency,

          receipt:
            result.order.receipt,
        },
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
