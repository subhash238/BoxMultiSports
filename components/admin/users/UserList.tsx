"use client";

import { useCallback, useEffect, useState } from "react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: "ADMIN" | "CUSTOMER";
  createdAt: string;
  bookingsCount: number;
  membershipsCount: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const roleStyles: Record<AdminUser["role"], string> = {
  ADMIN: "bg-[#B6F000]/30 text-[#3f5500]",
  CUSTOMER: "bg-gray-100 text-gray-700",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function UserList() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("ALL");
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
      if (roleFilter !== "ALL") params.set("role", roleFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/admin/users?${params}`, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message ?? "Failed to load users.");
      }

      setUsers(data.users ?? []);
      setPagination(data.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, debouncedSearch]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const changeRole = async (user: AdminUser, role: AdminUser["role"]) => {
    const label =
      role === "ADMIN"
        ? `make ${user.name} an ADMIN? They will get full access to this panel.`
        : `remove admin access from ${user.name}?`;
    if (!window.confirm(`Are you sure you want to ${label}`)) return;

    try {
      setBusyId(user.id);
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
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
          placeholder="Search name, mobile, email..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black sm:w-72"
        />
        <select
          value={roleFilter}
          onChange={(e) => {
            setPage(1);
            setRoleFilter(e.target.value);
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
        >
          <option value="ALL">All roles</option>
          <option value="CUSTOMER">Customers</option>
          <option value="ADMIN">Admins</option>
        </select>
        {pagination && (
          <span className="text-xs text-gray-500 sm:ml-auto">
            {pagination.total} total
          </span>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-500">
          Loading users...
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
      ) : users.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center">
          <p className="text-sm font-medium text-gray-700">No users found.</p>
          <p className="mt-1 text-xs text-gray-400">
            Customers who register on the website will show up here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Activity</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id} className="align-top hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-[#B6F000]">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-semibold text-gray-900">{u.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900">{u.mobile}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${roleStyles[u.role]}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <p>{u.bookingsCount} booking{u.bookingsCount === 1 ? "" : "s"}</p>
                    <p className="text-xs text-gray-500">
                      {u.membershipsCount} membership{u.membershipsCount === 1 ? "" : "s"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      {u.role === "CUSTOMER" ? (
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => changeRole(u, "ADMIN")}
                          className="rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                          Make Admin
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => changeRole(u, "CUSTOMER")}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        >
                          Remove Admin
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
