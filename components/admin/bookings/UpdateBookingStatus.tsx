"use client";

import { useState } from "react";

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

type UpdateBookingStatusProps = {
  bookingId: string;
  currentStatus: BookingStatus;
};

export default function UpdateBookingStatus({
  bookingId,
  currentStatus,
}: UpdateBookingStatusProps) {
  const [selectedStatus, setSelectedStatus] =
    useState<BookingStatus>(currentStatus);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // Determine Available Statuses
  // ==========================================

  const getAvailableStatuses = (): BookingStatus[] => {
    if (currentStatus === "PENDING") {
      return ["CONFIRMED", "CANCELLED"];
    }

    if (currentStatus === "CONFIRMED") {
      return ["COMPLETED", "CANCELLED"];
    }

    return [];
  };

  const availableStatuses =
    getAvailableStatuses();

  // ==========================================
  // Terminal Status
  // ==========================================

  if (
    currentStatus === "CANCELLED" ||
    currentStatus === "COMPLETED"
  ) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Booking Status
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          This booking can no longer be changed.
        </p>

        <div className="mt-4">
          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            {currentStatus}
          </span>
        </div>
      </div>
    );
  }

  // ==========================================
  // Handle Status Update
  // ==========================================

  const handleUpdate = async () => {
    if (selectedStatus === currentStatus) {
      setError(
        `Booking is already ${currentStatus}.`
      );

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to change the booking status from ${currentStatus} to ${selectedStatus}?`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // -----------------------------------------
      // PATCH Booking Status
      // -----------------------------------------

      const response = await fetch(
        `/api/admin/bookings/${bookingId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status: selectedStatus,
          }),
        }
      );

      // -----------------------------------------
      // Read Response Safely
      // -----------------------------------------

      const data = await response.json();

      // -----------------------------------------
      // Handle API Error
      // -----------------------------------------

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message ||
            "Failed to update booking status."
        );
      }

      // -----------------------------------------
      // Success
      // -----------------------------------------

      setSuccess(
        `Booking status changed to ${selectedStatus}.`
      );

      // -----------------------------------------
      // Refresh Page
      // -----------------------------------------

      window.location.reload();
    } catch (error) {
      console.error(
        "Update booking status error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update booking status."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="rounded-xl border bg-white p-6">
      {/* Header */}

      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Update Booking Status
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Change the current status of this booking.
        </p>
      </div>

      {/* Current Status */}

      <div className="mt-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Current Status
        </p>

        <span
          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
            currentStatus === "PENDING"
              ? "bg-yellow-100 text-yellow-700"
              : currentStatus === "CONFIRMED"
              ? "bg-green-100 text-green-700"
              : currentStatus === "CANCELLED"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {currentStatus}
        </span>
      </div>

      {/* Status Selector */}

      <div className="mt-5">
        <label
          htmlFor="booking-status"
          className="block text-sm font-medium text-gray-700"
        >
          Change Status
        </label>

        <select
          id="booking-status"
          value={selectedStatus}
          onChange={(event) =>
            setSelectedStatus(
              event.target.value as BookingStatus
            )
          }
          disabled={loading}
          className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          <option value={currentStatus}>
            {currentStatus}
          </option>

          {availableStatuses.map((status) => (
            <option
              key={status}
              value={status}
            >
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* Success */}

      {success && (
        <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm text-green-600">
            {success}
          </p>
        </div>
      )}

      {/* Update Button */}

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={handleUpdate}
          disabled={
            loading ||
            selectedStatus === currentStatus
          }
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Updating..."
            : "Update Status"}
        </button>
      </div>
    </div>
  );
}