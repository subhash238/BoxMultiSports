"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface Sport {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
}

interface SportsListProps {
  refreshKey?: number;
}

const ITEMS_PER_PAGE = 5;

export default function SportsList({
  refreshKey,
}: SportsListProps) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );

  // ==========================================
  // Search
  // ==========================================

  const [search, setSearch] = useState("");

  // ==========================================
  // Pagination
  // ==========================================

  const [currentPage, setCurrentPage] = useState(1);

  // ==========================================
  // Fetch Sports
  // ==========================================

  const fetchSports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/sports", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sports");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Failed to fetch sports"
        );
      }

      setSports(data.sports ?? []);
    } catch (error) {
      console.error("Fetch sports error:", error);

      setError("Unable to load sports.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // Initial Load + Refresh
  // ==========================================

  useEffect(() => {
    queueMicrotask(() => {
      void fetchSports();
    });
  }, [fetchSports, refreshKey]);

  // ==========================================
  // Delete Sport
  // ==========================================

  async function handleDelete(sport: Sport) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${sport.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(sport.id);
      setError("");

      const response = await fetch(
        `/api/admin/sports/${sport.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to delete sport."
        );
      }

      // Remove deleted sport immediately
      setSports((currentSports) =>
        currentSports.filter(
          (currentSport) =>
            currentSport.id !== sport.id
        )
      );

      // Confirm latest database state
      await fetchSports();
    } catch (error) {
      console.error("Delete sport error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete sport."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ==========================================
  // Filter Sports
  // ==========================================

  const filteredSports = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return sports;
    }

    return sports.filter((sport) => {
      return (
        sport.name.toLowerCase().includes(query) ||
        sport.slug.toLowerCase().includes(query) ||
        (sport.description ?? "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [sports, search]);

  // ==========================================
  // Reset page when search changes
  // ==========================================

  const [prevSearch, setPrevSearch] = useState(search);
  if (prevSearch !== search) {
    setPrevSearch(search);
    setCurrentPage(1);
  }

  // ==========================================
  // Pagination Calculations
  // ==========================================

  const totalPages = Math.ceil(
    filteredSports.length / ITEMS_PER_PAGE
  );

  const paginatedSports = useMemo(() => {
    const startIndex =
      (currentPage - 1) * ITEMS_PER_PAGE;

    const endIndex =
      startIndex + ITEMS_PER_PAGE;

    return filteredSports.slice(
      startIndex,
      endIndex
    );
  }, [filteredSports, currentPage]);

  // ==========================================
  // Keep Current Page Valid
  // ==========================================

  if (totalPages > 0 && currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  // ==========================================
  // Loading State
  // ==========================================

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-10 text-center">
        <p className="text-sm text-gray-500">
          Loading sports...
        </p>
      </div>
    );
  }

  // ==========================================
  // Error State
  // ==========================================

  if (error && sports.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-10 text-center">
        <p className="text-sm text-red-500">
          {error}
        </p>

        <button
          type="button"
          onClick={fetchSports}
          className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ==========================================
  // Empty State
  // ==========================================

  if (sports.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-10 text-center">
        <p className="text-sm text-gray-500">
          Sports will appear here.
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Add your first sport to get started.
        </p>
      </div>
    );
  }

  // ==========================================
  // Sports Table
  // ==========================================

  return (
    <div>
      {/* Delete / API Error */}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Search */}

      <div className="mb-5">
        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search sports..."
          className="w-full max-w-md rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
        />
      </div>

      {/* No Search Results */}

      {filteredSports.length === 0 ? (
        <div className="rounded-lg border bg-gray-50 p-8 text-center">
          <p className="text-sm font-medium text-gray-700">
            No sports found.
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Try a different search term.
          </p>
        </div>
      ) : (
        <>
          {/* Table */}

          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">
                  Sport
                </th>

                <th className="px-4 py-3 font-medium">
                  Slug
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
              {paginatedSports.map((sport) => {
                const isDeleting =
                  deletingId === sport.id;

                return (
                  <tr
                    key={sport.id}
                    className="border-b last:border-b-0"
                  >
                    {/* Sport */}

                    <td className="px-4 py-4">
                      <div className="font-medium">
                        {sport.name}
                      </div>

                      {sport.description && (
                        <div className="mt-1 text-xs text-gray-500">
                          {sport.description}
                        </div>
                      )}
                    </td>

                    {/* Slug */}

                    <td className="px-4 py-4 text-sm text-gray-500">
                      {sport.slug}
                    </td>

                    {/* Status */}

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          sport.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {sport.isActive
                          ? "ACTIVE"
                          : "INACTIVE"}
                      </span>
                    </td>

                    {/* Actions */}

                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-4">
                        {/* Edit */}

                        <Link
                          href={`/admin/sports/${sport.id}/edit`}
                          className="text-sm font-medium text-gray-700 hover:text-black"
                        >
                          Edit
                        </Link>

                        {/* Delete */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(sport)
                          }
                          disabled={isDeleting}
                          className="text-sm font-medium text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}

          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between border-t pt-4">
              {/* Result Information */}

              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-700">
                  {(currentPage - 1) *
                    ITEMS_PER_PAGE +
                    1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-gray-700">
                  {Math.min(
                    currentPage *
                      ITEMS_PER_PAGE,
                    filteredSports.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700">
                  {filteredSports.length}
                </span>{" "}
                sports
              </p>

              {/* Page Controls */}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(
                      (page) => page - 1
                    )
                  }
                  disabled={currentPage === 1}
                  className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="px-2 text-sm text-gray-600">
                  Page {currentPage} of{" "}
                  {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(
                      (page) => page + 1
                    )
                  }
                  disabled={
                    currentPage === totalPages
                  }
                  className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}