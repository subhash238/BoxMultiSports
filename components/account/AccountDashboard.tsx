"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CalendarDays,
  Clock,
  LogOut,
  Ticket,
} from "lucide-react";

import BookNowTrigger from "@/components/booking-widget/BookNowTrigger";

interface AccountUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
}

interface AccountBooking {
  id: string;
  bookingNumber: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  numberOfPlayers: number;
  totalAmount: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  paymentMethod: string;
  paymentStatus: string | null;
  sport: { id: string; name: string; slug: string; imageUrl: string | null };
}

interface AccountMembership {
  id: string;
  membershipNumber: string;
  startDate: string;
  endDate: string;
  amount: string;
  status: "PENDING" | "ACTIVE" | "CANCELLED";
  displayStatus: "PENDING" | "ACTIVE" | "CANCELLED" | "EXPIRED";
  paymentMethod: string;
  paymentStatus: string;
  daysLeft: number;
  plan: { id: string; slug: string; name: string; features: string[] };
}

type Tab = "upcoming" | "past" | "memberships";

const statusChip: Record<string, string> = {
  PENDING: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  CONFIRMED: "bg-[#B6F000]/15 text-[#B6F000] border-[#B6F000]/30",
  ACTIVE: "bg-[#B6F000]/15 text-[#B6F000] border-[#B6F000]/30",
  COMPLETED: "bg-sky-400/15 text-sky-300 border-sky-400/30",
  CANCELLED: "bg-white/10 text-white/50 border-white/15",
  EXPIRED: "bg-red-400/15 text-red-300 border-red-400/30",
};

const IST = "Asia/Kolkata";

function fmtDate(value: string, tz: string = IST) {
  return new Date(value).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: tz,
  });
}

function fmtTime(value: string) {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: IST,
  });
}

function fmtMoney(value: string) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function fmtDuration(minutes: number) {
  if (minutes % 60 === 0) {
    const h = minutes / 60;
    return `${h} ${h === 1 ? "Hour" : "Hours"}`;
  }
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function Chip({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${statusChip[status] ?? statusChip.CANCELLED}`}
    >
      {status}
    </span>
  );
}

function bookingHint(b: AccountBooking) {
  if (b.status === "PENDING" && b.paymentMethod === "PAY_AT_VENUE") {
    return "Reserved — pay cash/UPI at the venue to confirm.";
  }
  if (b.status === "PENDING") {
    return "Payment not completed yet.";
  }
  if (b.status === "CONFIRMED") {
    return "Confirmed — see you on the turf!";
  }
  return null;
}

export default function AccountDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [bookings, setBookings] = useState<AccountBooking[]>([]);
  const [memberships, setMemberships] = useState<AccountMembership[]>([]);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/account", { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/login?redirect=/account");
          return null;
        }
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message ?? "Unable to load your account.");
        }
        return data;
      })
      .then((data) => {
        if (!data || cancelled) return;
        setUser(data.user);
        setBookings(data.bookings ?? []);
        setMemberships(data.memberships ?? []);
        setNow(Date.now());
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.push("/");
    router.refresh();
  };

  const upcoming = bookings
    .filter((b) => new Date(b.endTime).getTime() >= now && b.status !== "CANCELLED")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const past = bookings.filter(
    (b) => new Date(b.endTime).getTime() < now || b.status === "CANCELLED"
  );
  const activeMemberships = memberships.filter((m) => m.displayStatus === "ACTIVE");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "upcoming", label: "Upcoming", count: upcoming.length },
    { key: "past", label: "Past", count: past.length },
    { key: "memberships", label: "Memberships", count: memberships.length },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050705] px-4 pb-20 pt-28 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-28 animate-pulse rounded-3xl bg-white/[0.04]" />
          <div className="h-48 animate-pulse rounded-3xl bg-white/[0.04]" />
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="min-h-screen bg-[#050705] px-4 pb-20 pt-28 sm:px-6">
        <div className="mx-auto max-w-md rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center">
          <p className="text-sm text-red-300">{error || "Please sign in to continue."}</p>
          <Link
            href="/login?redirect=/account"
            className="mt-5 inline-flex rounded-full bg-[#B6F000] px-6 py-2.5 text-sm font-bold text-black"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050705] px-4 pb-20 pt-28 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-3xl border border-white/[0.08] bg-white/[0.04] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#B6F000] text-xl font-black text-black">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8FBF00]">
                My Account
              </p>
              <h1 className="truncate text-2xl font-extrabold text-white">{user.name}</h1>
              <p className="truncate text-sm text-white/45">
                {user.mobile} · {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-red-400/50 hover:text-red-300"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: "Upcoming", value: upcoming.length, icon: CalendarDays },
            { label: "Total bookings", value: bookings.length, icon: Ticket },
            { label: "Active plans", value: activeMemberships.length, icon: BadgeCheck },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"
            >
              <s.icon size={16} className="text-[#B6F000]" />
              <p className="mt-2 text-2xl font-extrabold text-white">{s.value}</p>
              <p className="text-[11px] uppercase tracking-wider text-white/40">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 overflow-x-auto rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === t.key
                  ? "bg-[#B6F000] text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {t.label}
              <span className={`ml-1.5 text-xs ${tab === t.key ? "text-black/60" : "text-white/35"}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-5 space-y-3">
          {tab !== "memberships" &&
            ((tab === "upcoming" ? upcoming : past).length === 0 ? (
              <EmptyState
                title={tab === "upcoming" ? "No upcoming bookings" : "No past bookings"}
                subtitle={
                  tab === "upcoming"
                    ? "Grab a slot — cricket, football and more."
                    : "Your completed and cancelled bookings will appear here."
                }
                cta={tab === "upcoming"}
              />
            ) : (
              (tab === "upcoming" ? upcoming : past).map((b) => (
                <BookingCard key={b.id} booking={b} />
              ))
            ))}

          {tab === "memberships" &&
            (memberships.length === 0 ? (
              <EmptyState
                title="No memberships yet"
                subtitle="Pickleball monthly membership and Kids Academy plans are available."
                href="/#memberships"
                hrefLabel="View Plans"
              />
            ) : (
              memberships.map((m) => <MembershipCard key={m.id} membership={m} />)
            ))}
        </div>
      </div>
    </main>
  );
}

function EmptyState({
  title,
  subtitle,
  cta,
  href,
  hrefLabel,
}: {
  title: string;
  subtitle: string;
  cta?: boolean;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center">
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm text-white/45">{subtitle}</p>
      {cta && (
        <BookNowTrigger className="mt-5 inline-flex rounded-full bg-[#B6F000] px-6 py-2.5 text-sm font-bold text-black transition hover:brightness-110">
          Book Now
        </BookNowTrigger>
      )}
      {href && (
        <Link
          href={href}
          className="mt-5 inline-flex rounded-full bg-[#B6F000] px-6 py-2.5 text-sm font-bold text-black transition hover:brightness-110"
        >
          {hrefLabel}
        </Link>
      )}
    </div>
  );
}

function BookingCard({ booking: b }: { booking: AccountBooking }) {
  const hint = bookingHint(b);

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-white/15 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
            {b.bookingNumber}
          </p>
          <h3 className="mt-1 text-lg font-bold text-white">{b.sport.name}</h3>
        </div>
        <Chip status={b.status} />
      </div>

      <div className="mt-4 grid gap-3 text-sm text-white/70 sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <CalendarDays size={15} className="shrink-0 text-[#B6F000]" />
          {fmtDate(b.startTime)}
        </div>
        <div className="flex items-center gap-2">
          <Clock size={15} className="shrink-0 text-[#B6F000]" />
          {fmtTime(b.startTime)} – {fmtTime(b.endTime)} · {fmtDuration(b.duration)}
        </div>
        {/* Player count hidden for now.
        <div className="flex items-center gap-2">
          <Users size={15} className="shrink-0 text-[#B6F000]" />
          {b.numberOfPlayers} {b.numberOfPlayers === 1 ? "player" : "players"}
        </div>
        */}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-4">
        <p className="text-xs text-white/40">
          {b.paymentMethod === "PAY_AT_VENUE" ? "Pay at venue (Cash/UPI)" : "Paid online"}
          {hint ? ` · ${hint}` : ""}
        </p>
        <p className="text-base font-extrabold text-white">{fmtMoney(b.totalAmount)}</p>
      </div>
    </div>
  );
}

function MembershipCard({ membership: m }: { membership: AccountMembership }) {
  const total = Math.max(
    1,
    Math.round(
      (new Date(m.endDate).getTime() - new Date(m.startDate).getTime()) /
        (24 * 60 * 60 * 1000)
    )
  );
  const progress =
    m.displayStatus === "ACTIVE"
      ? Math.min(100, Math.max(0, ((total - m.daysLeft) / total) * 100))
      : m.displayStatus === "EXPIRED"
        ? 100
        : 0;

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
            {m.membershipNumber}
          </p>
          <h3 className="mt-1 text-lg font-bold text-white">{m.plan.name}</h3>
        </div>
        <Chip status={m.displayStatus} />
      </div>

      <div className="mt-4 grid gap-3 text-sm text-white/70 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <CalendarDays size={15} className="shrink-0 text-[#B6F000]" />
          {fmtDate(m.startDate, "UTC")} → {fmtDate(m.endDate, "UTC")}
        </div>
        <div className="flex items-center gap-2">
          <Clock size={15} className="shrink-0 text-[#B6F000]" />
          {m.displayStatus === "ACTIVE"
            ? m.daysLeft === 0
              ? "Expires today"
              : `${m.daysLeft} ${m.daysLeft === 1 ? "day" : "days"} left`
            : m.displayStatus === "EXPIRED"
              ? `Expired on ${fmtDate(m.endDate, "UTC")}`
              : m.displayStatus === "PENDING"
                ? m.paymentMethod === "PAY_AT_VENUE"
                  ? "Pay at venue to activate"
                  : "Payment pending"
                : "Cancelled"}
        </div>
      </div>

      {(m.displayStatus === "ACTIVE" || m.displayStatus === "EXPIRED") && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${m.displayStatus === "EXPIRED" ? "bg-red-400/70" : "bg-[#B6F000]"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-4">
        <p className="text-xs text-white/40">
          {m.paymentMethod === "PAY_AT_VENUE" ? "Pay at venue (Cash/UPI)" : "Paid online"} ·{" "}
          {m.paymentStatus === "CAPTURED" ? "Paid" : "Unpaid"}
        </p>
        <p className="text-base font-extrabold text-white">{fmtMoney(m.amount)}</p>
      </div>
    </div>
  );
}
