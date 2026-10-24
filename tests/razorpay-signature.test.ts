import crypto from "crypto";
import { beforeAll, describe, expect, it } from "vitest";

import { VerifyPaymentService } from "@/lib/services/payment/verify-payment.service";
import { PaymentWebhookService } from "@/lib/services/payment/webhook.service";

const ORDER_ID = "order_test123";
const PAYMENT_ID = "pay_test456";

function sign(orderId: string, paymentId: string): string {
  return crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

describe("razorpay signature verification", () => {
  beforeAll(() => {
    process.env.RAZORPAY_KEY_SECRET = "test_secret";
    process.env.RAZORPAY_WEBHOOK_SECRET =
      "test_webhook_secret";
  });

  it("accepts a valid signature", () => {
    const signature = sign(ORDER_ID, PAYMENT_ID);

    expect(
      VerifyPaymentService.verifyRazorpaySignature(
        ORDER_ID,
        PAYMENT_ID,
        signature
      )
    ).toBe(true);
  });

  it("rejects a tampered payment id", () => {
    const signature = sign(ORDER_ID, PAYMENT_ID);

    expect(
      VerifyPaymentService.verifyRazorpaySignature(
        ORDER_ID,
        "pay_other",
        signature
      )
    ).toBe(false);
  });

  it("rejects a garbage signature", () => {
    expect(
      VerifyPaymentService.verifyRazorpaySignature(
        ORDER_ID,
        PAYMENT_ID,
        "deadbeef"
      )
    ).toBe(false);
  });

  it("rejects empty inputs", () => {
    expect(
      VerifyPaymentService.verifyRazorpaySignature(
        "",
        PAYMENT_ID,
        "x"
      )
    ).toBe(false);
  });
});

describe("webhook signature verification", () => {
  it("accepts a valid webhook signature", () => {
    const body = JSON.stringify({
      event: "payment.captured",
    });

    const signature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET!
      )
      .update(body)
      .digest("hex");

    expect(
      PaymentWebhookService.verifyWebhookSignature(
        body,
        signature
      )
    ).toBe(true);
  });

  it("rejects a modified body", () => {
    const body = JSON.stringify({
      event: "payment.captured",
    });

    const signature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET!
      )
      .update(body)
      .digest("hex");

    expect(
      PaymentWebhookService.verifyWebhookSignature(
        body.replace("captured", "failed"),
        signature
      )
    ).toBe(false);
  });
});
