"use client";

import { useState } from "react";

type CancelBookingButtonProps = {
  bookingId: string;
  status: string;
};

export default function CancelBookingButton({
  bookingId,
  status,
}: CancelBookingButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cancel button should only be available
  // for PENDING or CONFIRMED bookings.
  const canCancel =
    status === "PENDING" || status === "CONFIRMED";

  if (!canCancel) {
    return null;
  }

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/bookings/${bookingId}`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to cancel booking."
        );
      }

      // Refresh the current page so the new
      // booking status is displayed.
      window.location.reload();
    } catch (error) {
      console.error(
        "Cancel booking error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to cancel booking."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleCancel}
        disabled={loading}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Cancelling..."
          : "Cancel Booking"}
      </button>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}