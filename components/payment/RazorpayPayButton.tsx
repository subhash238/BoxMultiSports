"use client";

import { useState } from "react";

import {
  createRazorpayOrder,
} from "@/lib/services/payment/create-order/createRazorpayOrder";

import {
  openRazorpayCheckout,
} from "@/lib/services/payment/checkout/razorpayCheckout";

// ==========================================
// Props
// ==========================================

interface RazorpayPayButtonProps {
  bookingId: string;
  guestPaymentToken: string | null;
  customerName?: string;
  customerEmail?: string;
  customerMobile?: string;
  amount: number;

  onSuccess?: () => void;

  onError?: (
    message: string
  ) => void;
}

// ==========================================
// Component
// ==========================================

export default function RazorpayPayButton({
  bookingId,
  guestPaymentToken,
  customerName,
  customerEmail,
  customerMobile,
  amount,
  onSuccess,
  onError,
}: RazorpayPayButtonProps) {
  const [loading, setLoading] =
    useState(false);

  // ==========================================
  // Handle Payment
  // ==========================================

  const handlePayment = async () => {
    try {
      setLoading(true);

      // ========================================
      // STEP 1
      // Create Razorpay Order
      // ========================================

      const result =
        await createRazorpayOrder(
          bookingId,
          guestPaymentToken
        );

      if (!result.order?.id) {
        throw new Error(
          "Razorpay order was not created."
        );
      }

      // ========================================
      // STEP 2
      // Get Public Razorpay Key
      // ========================================

      const razorpayKey =
        process.env
          .NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        throw new Error(
          "Razorpay public key is not configured."
        );
      }

      // ========================================
      // STEP 3
      // Open Razorpay Checkout
      // ========================================

      await openRazorpayCheckout({
        key: razorpayKey,

        amount:
          result.order.amount,

        currency:
          result.order.currency,

        name:
          "UniTurf",

        description:
          `Booking ${
            result.order.receipt ?? ""
          }`,

        order_id:
          result.order.id,

        prefill: {
          name:
            customerName,

          email:
            customerEmail,

          contact:
            customerMobile,
        },

        notes: {
          bookingId,
        },

        theme: {
          color: "#B6F000",
        },

        // ======================================
        // STEP 4
        // Razorpay Payment Success
        // ======================================

        handler: async (
          response
        ) => {
          try {
            // ==================================
            // STEP 5
            // Send Payment To Server
            // ==================================

            const verifyResponse =
              await fetch(
                "/api/payments/verify",
                {
                  method: "POST",

                  headers: {
                    "Content-Type":
                      "application/json",
                  },

                  credentials: "include",

                  body: JSON.stringify({
                    razorpay_payment_id:
                      response.razorpay_payment_id,

                    razorpay_order_id:
                      response.razorpay_order_id,

                    razorpay_signature:
                      response.razorpay_signature,

                    guestPaymentToken,
                  }),
                }
              );

            // ==================================
            // Read Verification Response
            // ==================================

            const verifyResult =
              await verifyResponse.json();

            // ==================================
            // Verification Failed
            // ==================================

            if (
              !verifyResponse.ok ||
              !verifyResult.success
            ) {
              throw new Error(
                verifyResult.message ??
                  "Payment verification failed."
              );
            }

            // ==================================
            // Payment Fully Verified
            // ==================================

            /*
             * IMPORTANT:
             *
             * We only call onSuccess AFTER
             * the server verifies the Razorpay
             * signature.
             *
             * The PaymentModal will then show
             * the Booking Confirmed screen.
             */

            onSuccess?.();

            setLoading(false);
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : "Payment verification failed.";

            onError?.(
              message
            );

            setLoading(false);
          }
        },

        // ======================================
        // Checkout Dismissed
        // ======================================

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to start payment.";

      onError?.(message);

      setLoading(false);
    }
  };

  // ==========================================
  // Button
  // ==========================================

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={loading}
      className="w-full rounded-2xl bg-[#B6F000] px-6 py-4 text-lg font-bold text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(182,240,0,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading
        ? "Processing Payment..."
        : `Pay ₹${amount.toFixed(2)}`}
    </button>
  );
}
