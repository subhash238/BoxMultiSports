"use client";

import { useState } from "react";

import RazorpayPayButton from "@/components/payment/RazorpayPayButton";
import ModalPortal from "./ModalPortal";

import {
  BookingData,
  CreatedBooking,
} from "./BookingWidget";

interface PaymentModalProps {
  booking: CreatedBooking;
  bookingData: BookingData;
  guestPaymentToken: string | null;
  loading?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({
  booking,
  bookingData,
  guestPaymentToken,
  loading,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [
    paymentError,
    setPaymentError,
  ] = useState<string | null>(
    null
  );

  const [
    paymentSuccess,
    setPaymentSuccess,
  ] = useState(false);

  const amount =
    Number(
      booking.totalAmount
    );

  const handleSuccess = () => {
    setPaymentSuccess(true);
    setPaymentError(null);

    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  const handleError = (
    message: string
  ) => {
    setPaymentError(message);
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md">

      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#111111] p-6 shadow-2xl md:p-8">

        {/* ======================================
            Close
        ====================================== */}

        {!loading &&
          !paymentSuccess && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-300 transition hover:bg-white/20 hover:text-white"
            >
              ×
            </button>
          )}

        {/* ======================================
            Success
        ====================================== */}

        {paymentSuccess ? (
          <div className="py-10 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#B6F000]/20 text-4xl">
              ✓
            </div>

            <h2 className="mt-6 text-3xl font-black text-white">
              Booking Confirmed!
            </h2>

            <p className="mt-3 text-gray-400">
              Your payment was successful.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-gray-400">
                Booking Number
              </p>

              <p className="mt-1 text-xl font-bold text-[#B6F000]">
                {booking.bookingNumber}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ==================================
                Header
            ================================== */}

            <div className="mb-7">

              <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[#B6F000]">
                Booking Created
              </span>

              <h2 className="mt-3 text-3xl font-black text-white">
                Complete Your Payment
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Your slot has been reserved temporarily.
                Complete payment to confirm your booking.
              </p>
            </div>

            {/* ==================================
                Booking Summary
            ================================== */}

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">
                  Booking No.
                </span>

                <span className="font-semibold text-white">
                  {booking.bookingNumber}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">
                  {booking.sportName
                    ? "Game"
                    : "Sport"}
                </span>

                <span className="font-semibold text-white">
                  {booking.sportName ??
                    bookingData.sport}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">
                  Date
                </span>

                <span className="font-semibold text-white">
                  {bookingData.date}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">
                  Time
                </span>

                <span className="font-semibold text-white">
                  {bookingData.time}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">
                  Duration
                </span>

                <span className="font-semibold text-white">
                  {bookingData.duration}
                </span>
              </div>

              <div className="my-2 border-t border-white/10" />

              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-white">
                  Total Amount
                </span>

                <span className="text-2xl font-black text-[#B6F000]">
                  ₹{amount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* ==================================
                Payment Error
            ================================== */}

            {paymentError && (
              <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {paymentError}
              </div>
            )}

            {/* ==================================
                Razorpay Payment
            ================================== */}

            <div className="mt-6">

              <RazorpayPayButton
                bookingId={
                  booking.id
                }

                guestPaymentToken={
                  guestPaymentToken
                }

                customerName={
                  bookingData.fullName
                }

                customerEmail={
                  bookingData.email
                }

                customerMobile={
                  bookingData.mobile
                }

                amount={
                  amount
                }

                onSuccess={
                  handleSuccess
                }

                onError={
                  handleError
                }
              />
            </div>

            {/* ==================================
                Cancel
            ================================== */}

            {!loading && (
              <button
                type="button"
                onClick={onClose}
                className="mt-4 w-full rounded-2xl border border-white/10 px-6 py-3 font-semibold text-gray-300 transition hover:bg-white/5 hover:text-white"
              >
                Pay Later
              </button>
            )}

            <p className="mt-5 text-center text-xs text-gray-500">
              Secure payment powered by Razorpay.
            </p>
          </>
        )}
      </div>
      </div>
    </ModalPortal>
  );
}
