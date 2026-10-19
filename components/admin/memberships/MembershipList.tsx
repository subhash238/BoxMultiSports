"use client";

import { useCallback, useEffect, useState } from "react";

interface Membership {
  id: string;
  membershipNumber: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  notes: string | null;
  startDate: string;
  endDate: string;
  amount: string | number;
  status: "PENDING" | "ACTIVE" | "CANCELLED";
  paymentMethod: string;
  paymentStatus: string;
  paidAt: string | null;
  createdAt: string;
  plan: { id: string; slug: string; name: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  ACTIVE: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-200 text-gray-700",
  EXPIRED: "bg-red-100 text-red-700",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function displayStatus(m: Membership): string {
  if (m.status === "ACTIVE" && new Date(m.endDate) < new Date()) {
    return "EXPIRED";
  }
  return m.status;
}

export default function MembershipList() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/admin/memberships?${params}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message ?? "Failed to load memberships.");
      }

      setMemberships(data.memberships ?? []);
      setPagination(data.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load memberships.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const updateStatus = async (id: string, status: "ACTIVE" | "CANCELLED") => {
    const label = status === "ACTIVE" ? "mark this membership ACTIVE (payment received)" : "cancel this membership";
    if (!window.confirm(`Are you sure you want to ${label}?`)) return;

    try {
      setBusyId(id);
      const res = await fetch(`/api/admin/memberships/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message ?? "Update failed.");
      }
      await load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search number, name, mobile, email..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black sm:w-72"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        {pagination && (
          <span className="text-xs text-gray-500 sm:ml-auto">
            {pagination.total} total
          </span>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500">
          Loading memberships...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      ) : memberships.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center">
          <p className="text-sm font-medium text-gray-700">No memberships yet.</p>
          <p className="mt-1 text-xs text-gray-400">
            Plans purchased from the website will show up here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Membership</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Validity</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {memberships.map((m) => {
                const status = displayStatus(m);
                return (
                  <tr key={m.id} className="align-top hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{m.membershipNumber}</p>
                      <p className="text-xs text-gray-400">{formatDate(m.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{m.customerName}</p>
                      <p className="text-xs text-gray-500">{m.customerMobile}</p>
                      <p className="text-xs text-gray-400">{m.customerEmail}</p>
                      {m.notes && (
                        <p className="mt-1 max-w-[220px] text-xs italic text-gray-500">
                          {m.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{m.plan.name}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDate(m.startDate)}
                      <span className="text-gray-400"> → </span>
                      {formatDate(m.endDate)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">
                        ₹{Number(m.amount).toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {m.paymentMethod === "PAY_AT_VENUE" ? "At venue" : "Online"} ·{" "}
                        {m.paymentStatus === "CAPTURED" ? "Paid" : "Unpaid"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {m.status === "PENDING" && (
                          <button
                            type="button"
                            disabled={busyId === m.id}
                            onClick={() => updateStatus(m.id, "ACTIVE")}
                            className="rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                          >
                            Mark Paid
                          </button>
                        )}
                        {m.status !== "CANCELLED" && (
                          <button
                            type="button"
                            disabled={busyId === m.id}
                            onClick={() => updateStatus(m.id, "CANCELLED")}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-gray-500">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
