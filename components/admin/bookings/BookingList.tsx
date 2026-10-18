"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

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
}

interface Booking {
  id: string;
  bookingNumber: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  numberOfPlayers: number;
  totalAmount: string | number;
  status: string;

  customerName: string | null;
  customerEmail: string | null;
  customerMobile: string | null;
  specialRequest: string | null;

  user: BookingUser | null;
  sport: BookingSport;
}

interface BookingResponse {
  success: boolean;
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function BookingList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // STEP 1 — Status Filter
  // ==========================================

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  // ==========================================
  // STEP 2 — Date Filter
  // ==========================================

  const [dateFilter, setDateFilter] =
    useState("ALL");

  // ==========================================
  // STEP 3 — Search
  // ==========================================

  const [search, setSearch] =
    useState("");

  // ==========================================
  // STEP 4 — Debounced Search
  // ==========================================

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // ==========================================
  // STEP 5 — Fetch Bookings
  // ==========================================

  const fetchBookings = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams();

        // -----------------------------------------
        // Pagination
        // -----------------------------------------

        params.set("page", "1");
        params.set("limit", "10");

        // -----------------------------------------
        // Status Filter
        // -----------------------------------------

        if (statusFilter !== "ALL") {
          params.set(
            "status",
            statusFilter
          );
        }

        // -----------------------------------------
        // Date Filter
        // -----------------------------------------

        if (dateFilter !== "ALL") {
          params.set(
            "dateFilter",
            dateFilter
          );
        }

        // -----------------------------------------
        // Database Search
        // -----------------------------------------

        if (debouncedSearch !== "") {
          params.set(
            "search",
            debouncedSearch
          );
        }

        // -----------------------------------------
        // API Request
        // -----------------------------------------

        const response = await fetch(
          `/api/admin/bookings?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        const data: BookingResponse =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            "message" in data
              ? String(data.message)
              : "Failed to load bookings."
          );
        }

        setBookings(
          data.bookings ?? []
        );
      } catch (error) {
        console.error(
          "Fetch admin bookings error:",
          error
        );

        setError(
          "Unable to load bookings."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      statusFilter,
      dateFilter,
      debouncedSearch,
    ]
  );

  // ==========================================
  // Fetch On Initial Load / Filter / Search
  // ==========================================

  useEffect(() => {
    // Defer the synchronous loading-state update
    // out of the effect body.
    queueMicrotask(() => {
      void fetchBookings();
    });
  }, [fetchBookings]);

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        <p className="text-sm text-gray-500">
          Loading bookings...
        </p>
      </div>
    );
  }

  // ==========================================
  // Error
  // ==========================================

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">
          {error}
        </p>

        <button
          type="button"
          onClick={fetchBookings}
          className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ==========================================
  // Page
  // ==========================================

  return (
    <div>

      {/* ==========================================
          Filters
          ========================================== */}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">

        <div className="flex flex-wrap items-center gap-4">

          {/* ==========================================
              Search
              ========================================== */}

          <div className="flex flex-col sm:block">
            <label
              htmlFor="booking-search"
              className="text-sm font-medium text-gray-700"
            >
              Search
            </label>

            <input
              id="booking-search"
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Booking number, name, mobile..."
              className="mt-1 w-full rounded-lg sm:ml-3 sm:mt-0 sm:w-64 border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>

          {/* ==========================================
              Status Filter
              ========================================== */}

          <div className="flex flex-col sm:block">
            <label
              htmlFor="status-filter"
              className="text-sm font-medium text-gray-700"
            >
              Status
            </label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="mt-1 w-full rounded-lg sm:ml-3 sm:mt-0 sm:w-auto border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
            >
              <option value="ALL">
                All
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="CONFIRMED">
                Confirmed
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>

              <option value="COMPLETED">
                Completed
              </option>
            </select>
          </div>

          {/* ==========================================
              Date Filter
              ========================================== */}

          <div className="flex flex-col sm:block">
            <label
              htmlFor="date-filter"
              className="text-sm font-medium text-gray-700"
            >
              Date
            </label>

            <select
              id="date-filter"
              value={dateFilter}
              onChange={(event) =>
                setDateFilter(
                  event.target.value
                )
              }
              className="mt-1 w-full rounded-lg sm:ml-3 sm:mt-0 sm:w-auto border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
            >
              <option value="ALL">
                All Dates
              </option>

              <option value="TODAY">
                Today
              </option>

              <option value="UPCOMING">
                Upcoming
              </option>

              <option value="PAST">
                Past
              </option>
            </select>
          </div>

        </div>
      </div>

      {/* ==========================================
          Empty
          ========================================== */}

      {bookings.length === 0 ? (

        <div className="rounded-xl border bg-white p-10 text-center">

          <p className="text-sm font-medium text-gray-700">
            No bookings found.
          </p>

          <p className="mt-1 text-xs text-gray-400">
            No bookings match the selected filters.
          </p>

        </div>

      ) : (

        /* ==========================================
           Booking Table
           ========================================== */

        <div className="overflow-x-auto rounded-xl border bg-white">

          <table className="w-full min-w-[1000px] text-left text-sm">

            <thead className="border-b bg-gray-50 text-xs text-gray-500">

              <tr>

                <th className="px-4 py-3 font-medium">
                  Booking
                </th>

                <th className="px-4 py-3 font-medium">
                  Customer
                </th>

                <th className="px-4 py-3 font-medium">
                  Sport
                </th>

                <th className="px-4 py-3 font-medium">
                  Date
                </th>

                <th className="px-4 py-3 font-medium">
                  Time
                </th>

                <th className="px-4 py-3 font-medium">
                  Duration
                </th>

                <th className="px-4 py-3 font-medium">
                  Amount
                </th>

                <th className="px-4 py-3 font-medium">
                  Status
                </th>

                <th className="px-4 py-3 text-right font-medium">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {bookings.map((booking) => {

                const bookingDate =
                  new Date(
                    booking.bookingDate
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  );

                const startTime =
                  new Date(
                    booking.startTime
                  ).toLocaleTimeString(
                    "en-IN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );

                const endTime =
                  new Date(
                    booking.endTime
                  ).toLocaleTimeString(
                    "en-IN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );

                const statusClass =
                  booking.status ===
                  "CONFIRMED"
                    ? "bg-green-100 text-green-700"
                    : booking.status ===
                      "CANCELLED"
                    ? "bg-red-100 text-red-700"
                    : booking.status ===
                      "COMPLETED"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700";

                return (
                  <tr
                    key={booking.id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >

                    {/* Booking */}

                    <td className="px-4 py-4">

                      <div className="font-medium">
                        {booking.bookingNumber}
                      </div>

                      <div className="mt-1 text-xs text-gray-400">
                        {booking.id}
                      </div>

                    </td>

                    {/* Customer */}

                    <td className="px-4 py-4">

                      <div className="font-medium">
                        {booking.user?.name ??
                          booking.customerName ??
                          "Guest"}
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        {booking.user?.mobile ??
                          booking.customerMobile ??
                          "—"}
                      </div>

                    </td>

                    {/* Sport */}

                    <td className="px-4 py-4">

                      <div className="font-medium">
                        {booking.sport.name}
                      </div>

                      <div className="mt-1 text-xs text-gray-400">
                        {booking.sport.slug}
                      </div>

                    </td>

                    {/* Date */}

                    <td className="whitespace-nowrap px-4 py-4">
                      {bookingDate}
                    </td>

                    {/* Time */}

                    <td className="whitespace-nowrap px-4 py-4">
                      {startTime} - {endTime}
                    </td>

                    {/* Duration */}

                    <td className="px-4 py-4">
                      {booking.duration} min
                    </td>

                    {/* Amount */}

                    <td className="whitespace-nowrap px-4 py-4 font-medium">
                      ₹
                      {Number(
                        booking.totalAmount
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    {/* Status */}

                    <td className="px-4 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}
                      >
                        {booking.status}
                      </span>

                    </td>

                    {/* Actions */}

                    <td className="px-4 py-4 text-right">

                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="text-sm font-medium text-gray-700 hover:text-black"
                      >
                        View
                      </Link>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}