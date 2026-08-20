"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import CancelBookingButton from "@/components/admin/bookings/CancelBookingButton";
import UpdateBookingStatus from "@/components/admin/bookings/UpdateBookingStatus";

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "CAPTURED"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

type PaymentRecoveryState =
  | "REVIEW_REQUIRED"
  | "REFUND_PENDING"
  | "RESOLVED";

interface BookingUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
}

interface BookingSport {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  pricePerHour: string | number;
}

interface BookingStatusHistory {
  id: string;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  changedById: string;
  createdAt: string;
  changedBy: {
    id: string;
    name: string;
    email: string;
    mobile: string;
  };
}

interface BookingPayment {
  status: PaymentStatus;
  recoveryState: PaymentRecoveryState | null;
  amount: string | number;
  currency: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Booking {
  id: string;
  bookingNumber: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: string | number;
  status: BookingStatus;
  user: BookingUser;
  sport: BookingSport;
  payment: BookingPayment | null;
  statusHistory: BookingStatusHistory[];
}

interface BookingDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BookingDetailsPage({
  params,
}: BookingDetailsPageProps) {
  const [bookingId, setBookingId] =
    useState("");

  const [booking, setBooking] =
    useState<Booking | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // Get Booking ID
  // ==========================================

  useEffect(() => {
    async function getParams() {
      const resolvedParams =
        await params;

      setBookingId(resolvedParams.id);
    }

    getParams();
  }, [params]);

  // ==========================================
  // Fetch Booking Details
  // ==========================================

  useEffect(() => {
    if (!bookingId) {
      return;
    }

    async function fetchBooking() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/bookings/${bookingId}`,
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to load booking details."
          );
        }

        setBooking(data.booking);
      } catch (error) {
        console.error(
          "Booking details error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load booking details."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [bookingId]);

  // ==========================================
  // Loading State
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading booking details...
        </div>
      </div>
    );
  }

  // ==========================================
  // Error State
  // ==========================================

  if (error) {
    return (
      <div className="rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-red-600">
          Unable to Load Booking
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          {error}
        </p>

        <Link
          href="/admin/bookings"
          className="mt-6 inline-block rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          ← Back to Bookings
        </Link>
      </div>
    );
  }

  // ==========================================
  // Booking Not Found
  // ==========================================

  if (!booking) {
    return (
      <div className="rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold">
          Booking Not Found
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          The booking you are looking for does not
          exist.
        </p>

        <Link
          href="/admin/bookings"
          className="mt-6 inline-block rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          ← Back to Bookings
        </Link>
      </div>
    );
  }

  // ==========================================
  // Format Date
  // ==========================================

  const formattedDate = new Date(
    booking.bookingDate
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // ==========================================
  // Format Time
  // ==========================================

  const formattedStartTime = new Date(
    booking.startTime
  ).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const formattedEndTime = new Date(
    booking.endTime
  ).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // ==========================================
  // Status Styling
  // ==========================================

  const statusStyles: Record<
    BookingStatus,
    string
  > = {
    PENDING:
      "bg-yellow-100 text-yellow-700",

    CONFIRMED:
      "bg-green-100 text-green-700",

    CANCELLED:
      "bg-red-100 text-red-700",

    COMPLETED:
      "bg-blue-100 text-blue-700",
  };

  const statusClass =
    statusStyles[booking.status];

  const requiresRefundReview =
    booking.status === "CANCELLED" &&
    booking.payment?.status === "CAPTURED" &&
    booking.payment.recoveryState ===
      "REVIEW_REQUIRED";

  // ==========================================
  // Format History Date
  // ==========================================

  const formatHistoryDate = (
    date: string
  ) => {
    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="space-y-6">

      {/* ======================================
          Page Header
      ====================================== */}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Booking Details
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View complete information about this booking.
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}
          >
            {booking.status}
          </span>

          <CancelBookingButton
            bookingId={booking.id}
            status={booking.status}
          />

        </div>
      </div>

      {requiresRefundReview && booking.payment && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-900 shadow-sm">
          <h2 className="text-lg font-semibold">
            Payment captured — refund review required
          </h2>

          <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
            <p>
              <span className="font-medium">Amount:</span>{" "}
              {booking.payment.currency}{" "}
              {Number(booking.payment.amount).toLocaleString(
                "en-IN"
              )}
            </p>

            <p>
              <span className="font-medium">Payment status:</span>{" "}
              {booking.payment.status}
            </p>

            <p>
              <span className="font-medium">Recovery state:</span>{" "}
              {booking.payment.recoveryState}
            </p>

            <p className="md:col-span-3">
              <span className="font-medium">Payment ID:</span>{" "}
              {booking.payment.razorpayPaymentId ?? "Not available"}
            </p>
          </div>
        </div>
      )}

      {/* ======================================
          Booking Information
      ====================================== */}

      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Booking Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Basic information about the booking.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {/* Booking Number */}

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Booking Number
            </p>

            <p className="mt-1 font-semibold">
              {booking.bookingNumber}
            </p>
          </div>

          {/* Date */}

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Booking Date
            </p>

            <p className="mt-1 font-medium">
              {formattedDate}
            </p>
          </div>

          {/* Time */}

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Time
            </p>

            <p className="mt-1 font-medium">
              {formattedStartTime} -{" "}
              {formattedEndTime}
            </p>
          </div>

          {/* Duration */}

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Duration
            </p>

            <p className="mt-1 font-medium">
              {booking.duration} minutes
            </p>
          </div>

          {/* Amount */}

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Total Amount
            </p>

            <p className="mt-1 text-lg font-semibold">
              ₹
              {Number(
                booking.totalAmount
              ).toLocaleString("en-IN")}
            </p>
          </div>

          {/* Status */}

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Status
            </p>

            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}
            >
              {booking.status}
            </span>
          </div>

        </div>
      </div>

      {/* ======================================
          Payment Information
      ====================================== */}

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Payment Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Read-only payment and recovery details.
          </p>
        </div>

        {booking.payment ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase text-gray-400">
                Payment Status
              </p>
              <p className="mt-1 font-medium">
                {booking.payment.status}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-400">
                Recovery State
              </p>
              <p className="mt-1 font-medium">
                {booking.payment.recoveryState ?? "None"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-400">
                Amount
              </p>
              <p className="mt-1 font-medium">
                {booking.payment.currency}{" "}
                {Number(booking.payment.amount).toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-400">
                Razorpay Order ID
              </p>
              <p className="mt-1 break-all font-medium">
                {booking.payment.razorpayOrderId ?? "Not available"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-400">
                Razorpay Payment ID
              </p>
              <p className="mt-1 break-all font-medium">
                {booking.payment.razorpayPaymentId ?? "Not available"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-400">
                Created At
              </p>
              <p className="mt-1 font-medium">
                {formatHistoryDate(booking.payment.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-400">
                Updated At
              </p>
              <p className="mt-1 font-medium">
                {formatHistoryDate(booking.payment.updatedAt)}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-gray-50 p-6 text-center">
            <p className="text-sm font-medium text-gray-600">
              No payment record for this booking.
            </p>
          </div>
        )}
      </div>

      {/* ======================================
          Update Booking Status
      ====================================== */}

      <UpdateBookingStatus
        bookingId={booking.id}
        currentStatus={booking.status}
      />

      {/* ======================================
          Booking Status History
      ====================================== */}

      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Status History
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Complete audit trail of booking status changes.
          </p>
        </div>

        {booking.statusHistory.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-gray-50 p-6 text-center">
            <p className="text-sm font-medium text-gray-600">
              No status changes recorded yet.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Status changes will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {booking.statusHistory.map(
              (history, index) => {
                const fromStatus =
                  history.fromStatus;

                const toStatus =
                  history.toStatus;

                return (
                  <div
                    key={history.id}
                    className="relative flex gap-4"
                  >

                    {/* Timeline */}

                    <div className="flex flex-col items-center">

                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                          statusStyles[
                            toStatus
                          ]
                        }`}
                      >
                        {index + 1}
                      </div>

                      {index !==
                        booking.statusHistory
                          .length -
                          1 && (
                        <div className="mt-2 h-full min-h-[50px] w-px bg-gray-200" />
                      )}

                    </div>

                    {/* History Details */}

                    <div className="flex-1 pb-4">

                      <div className="flex flex-wrap items-center gap-2">

                        {fromStatus ? (
                          <>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                statusStyles[
                                  fromStatus
                                ]
                              }`}
                            >
                              {fromStatus}
                            </span>

                            <span className="text-sm text-gray-400">
                              →
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Initial Status
                          </span>
                        )}

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            statusStyles[
                              toStatus
                            ]
                          }`}
                        >
                          {toStatus}
                        </span>

                      </div>

                      {/* Changed By */}

                      <div className="mt-3">

                        <p className="text-sm font-medium text-gray-700">
                          Changed by{" "}
                          {history.changedBy.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {history.changedBy.email}
                        </p>

                      </div>

                      {/* Date */}

                      <p className="mt-2 text-xs text-gray-400">
                        {formatHistoryDate(
                          history.createdAt
                        )}
                      </p>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}
      </div>

      {/* ======================================
          Customer Information
      ====================================== */}

      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Customer Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Customer who created this booking.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">

          {/* Name */}

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Name
            </p>

            <p className="mt-1 font-medium">
              {booking.user.name}
            </p>
          </div>

          {/* Email */}

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Email
            </p>

            <p className="mt-1 font-medium">
              {booking.user.email}
            </p>
          </div>

          {/* Mobile */}

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Mobile
            </p>

            <p className="mt-1 font-medium">
              {booking.user.mobile}
            </p>
          </div>

        </div>
      </div>

      {/* ======================================
          Sport Information
      ====================================== */}

      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Sport Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Sport selected for this booking.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">

          {/* Sport */}

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Sport
            </p>

            <p className="mt-1 font-semibold">
              {booking.sport.name}
            </p>
          </div>

          {/* Slug */}

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Slug
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {booking.sport.slug}
            </p>
          </div>

          {/* Price */}

          <div>
            <p className="text-xs font-medium uppercase text-gray-400">
              Price Per Hour
            </p>

            <p className="mt-1 font-semibold">
              ₹
              {Number(
                booking.sport.pricePerHour
              ).toLocaleString("en-IN")}
              /hr
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
