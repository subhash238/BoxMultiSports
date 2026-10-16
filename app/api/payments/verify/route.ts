import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

import {
  PaymentService,
} from "@/lib/services/payment/payment.service";

// ==========================================
// POST - Verify Razorpay Payment
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

    const razorpayPaymentId =
      body?.razorpay_payment_id;

    const razorpayOrderId =
      body?.razorpay_order_id;

    const razorpaySignature =
      body?.razorpay_signature;

    const guestPaymentToken =
      body?.guestPaymentToken;

    // ==========================================
    // Validate Input
    // ==========================================

    if (
      typeof razorpayPaymentId !==
        "string" ||
      typeof razorpayOrderId !==
        "string" ||
      typeof razorpaySignature !==
        "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay payment verification data is required.",
        },
        {
          status: 400,
        }
      );
    }

    const payment =
      await prisma.payment.findUnique({
        where: {
          razorpayOrderId,
        },
        select: {
          booking: {
            select: {
              userId: true,
            },
          },
        },
      });

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment not found.",
        },
        {
          status: 404,
        }
      );
    }

    let authorization;

    if (payment.booking.userId !== null) {
      const user =
        await getCurrentUser(request);

      if (
        payment.booking.userId !==
        user.id
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You are not authorized to verify this payment.",
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
      if (
        typeof guestPaymentToken !==
          "string" ||
        !guestPaymentToken.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You are not authorized to verify this payment.",
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
    // Verify Payment
    // ==========================================

    const result =
      await PaymentService.verifyRazorpayPayment(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        authorization
      );

    // ==========================================
    // Success
    // ==========================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Payment verified and booking confirmed successfully.",

        payment: {
          status:
            result.payment.status,
        },

        booking: {
          id:
            result.booking.id,

          bookingNumber:
            result.booking.bookingNumber,

          status:
            result.booking.status,
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

    if (
      error instanceof AppError
    ) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status:
            error.statusCode,
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
