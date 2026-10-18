import {
  Trophy,
  CalendarDays,
  Users,
  IndianRupee,
} from "lucide-react";

import StatCard from "@/components/admin/dashboard/StatCard";
import RecentBookings from "@/components/admin/dashboard/RecentBookings";

import { DashboardService } from "@/lib/services/dashboard/dashboard.service";

export default async function DashboardPage() {
  const [stats, recentBookings] = await Promise.all([
    DashboardService.getStats(),
    DashboardService.getRecentBookings(),
  ]);

  return (
    <div className="space-y-8">
      {/* ==========================================
          Dashboard Header
          ========================================== */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          Dashboard
        </h1>

        <p className="mt-1 text-gray-500">
          Welcome back, Admin.
        </p>
      </div>

      {/* ==========================================
          Statistics Cards
          ========================================== */}
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        <StatCard
          title="Sports"
          value={stats.sports}
          icon={<Trophy size={28} />}
        />

        <StatCard
          title="Bookings"
          value={stats.bookings}
          icon={<CalendarDays size={28} />}
        />

        <StatCard
          title="Customers"
          value={stats.customers}
          icon={<Users size={28} />}
        />

        <StatCard
          title="Revenue"
          value={`₹${stats.revenue}`}
          icon={<IndianRupee size={28} />}
        />
      </div>

      {/* ==========================================
          Recent Bookings
          ========================================== */}
      <RecentBookings
        bookings={recentBookings}
      />
    </div>
  );
}