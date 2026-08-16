"use client";

import { useState } from "react";
import SportsList from "@/components/admin/sports/SportsList";
import AddSportForm from "@/components/admin/sports/AddSportForm";

export default function AdminSportsPage() {
  const [isAddingSport, setIsAddingSport] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      {/* ================================
          Page Header
      ================================= */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Sports
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage sports available for booking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingSport(true)}
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          + Add Sport
        </button>
      </div>

      {/* ================================
          Sports List
      ================================= */}

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            All Sports
          </h2>

          <p className="text-sm text-gray-500">
            View and manage your sports.
          </p>
        </div>

        <SportsList refreshKey={refreshKey} />
      </div>

      {/* ================================
          Add Sport Modal
      ================================= */}

      {isAddingSport && (
        <AddSportForm
          onClose={() => setIsAddingSport(false)}
          onSuccess={() =>
            setRefreshKey((current) => current + 1)
            }
        />
      )}
    </div>
  );
}