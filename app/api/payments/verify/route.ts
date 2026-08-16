import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";

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
    // Get Current User
    // ==========================================

    const user =
      await getCurrentUser(request);

    // ==========================================
    // Read Request Body
    // ==========================================

    const body =
      await request.json();

    const razorpayPaymentId =
      body?.razorpay_payment_id;

    const razorpayOrderId =
      body?.razorpay_order_id;

    const razorpaySignature =
      body?.razorpay_signature;

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

    // ==========================================
    // Verify Payment
    // ==========================================

    const result =
      await PaymentService.verifyRazorpayPayment(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        user.id
      );

    // ==========================================
    // Success
    // ==========================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Payment verified and booking confirmed successfully.",

        payment:
          result.payment,

        booking:
          result.booking,
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

    console.error(
      "Razorpay payment verification error:",
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