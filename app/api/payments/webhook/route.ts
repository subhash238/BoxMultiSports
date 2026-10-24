import { NextRequest, NextResponse } from "next/server";

import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

import { PaymentWebhookService } from "@/lib/services/payment/webhook.service";

// ==========================================
// POST - Razorpay Webhook
// ==========================================
//
// Configure in the Razorpay dashboard:
//   URL:    <site>/api/payments/webhook
//   Secret: RAZORPAY_WEBHOOK_SECRET
//   Events: payment.captured, payment.failed
// ==========================================

export async function POST(request: NextRequest) {
  try {
    const signature =
      request.headers.get("x-razorpay-signature") ??
      "";

    const rawBody = await request.text();

    await PaymentWebhookService.handleWebhook(
      rawBody,
      signature
    );

    // Always 200 on accepted/ignored events so
    // Razorpay does not keep retrying them.
    return NextResponse.json(
      {
        success: true,
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

    logger.error("Razorpay webhook processing failed.", {
      failure:
        error instanceof Error
          ? error.message
          : "Unknown error.",
    });

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
