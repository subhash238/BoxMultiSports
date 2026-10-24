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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Sports
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage sports available for booking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingSport(true)}
          className="self-start rounded-xl bg-[#0a0f0a] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:self-auto"
        >
          + Add Sport
        </button>
      </div>

      {/* ================================
          Sports List
      ================================= */}

      <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm sm:p-6">
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