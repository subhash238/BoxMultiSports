"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

import ModalPortal from "@/components/booking-widget/ModalPortal";
import { openRazorpayCheckout } from "@/lib/services/payment/checkout/razorpayCheckout";

import type { MembershipPlan } from "./MembershipPlans";

type PaymentMethod = "ONLINE" | "PAY_AT_VENUE";

interface CreatedMembership {
  id: string;
  membershipNumber: string;
  startDate: string;
  endDate: string;
  amount: string | number;
  status: string;
  paymentMethod: string;
  plan: { name: string };
}

interface MembershipModalProps {
  plan: MembershipPlan;
  onClose: () => void;
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#B6F000]/60 focus:bg-white/[0.06]";

function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function MembershipModal({
  plan,
  onClose,
}: MembershipModalProps) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    startDate: todayIso(),
    notes: "",
    paymentMethod: "ONLINE" as PaymentMethod,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<CreatedMembership | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.user) return;
        setForm((prev) => ({
          ...prev,
          fullName: prev.fullName || data.user.name || "",
          email: prev.email || data.user.email || "",
          mobile: prev.mobile || data.user.mobile || "",
        }));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const price = Number(plan.price);
  const isAcademy = plan.slug.includes("academy") || plan.slug.includes("kids");

  const update = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const payOnline = async (
    membership: CreatedMembership,
    paymentToken: string
  ) => {
    const orderResponse = await fetch("/api/memberships/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ membershipId: membership.id, paymentToken }),
    });

    const orderResult = await orderResponse.json();

    if (!orderResponse.ok || !orderResult.success) {
      throw new Error(orderResult.message ?? "Unable to start payment.");
    }

    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!key) {
      throw new Error("Razorpay public key is not configured.");
    }

    await new Promise<void>((resolve, reject) => {
      void openRazorpayCheckout({
        key,
        amount: orderResult.order.amount,
        currency: orderResult.order.currency,
        name: "UniTurf",
        description: `${plan.name} — ${membership.membershipNumber}`,
        order_id: orderResult.order.id,
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.mobile,
        },
        notes: { membershipId: membership.id },
        theme: { color: "#B6F000" },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch("/api/memberships/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                membershipId: membership.id,
                paymentToken,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyResult = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyResult.success) {
              throw new Error(
                verifyResult.message ?? "Payment verification failed."
              );
            }

            setDone(verifyResult.membership);
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () =>
            reject(new Error("Payment cancelled. Your plan is not active yet.")),
        },
      }).catch(reject);
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planSlug: plan.slug,
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          mobile: form.mobile.replace(/\D/g, ""),
          startDate: form.startDate,
          paymentMethod: form.paymentMethod,
          notes: form.notes.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Unable to create membership.");
      }

      const membership: CreatedMembership = result.membership;

      if (form.paymentMethod === "PAY_AT_VENUE") {
        setDone(membership);
        return;
      }

      await payOnline(membership, result.paymentToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md">
        <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#0d120d] p-6 shadow-2xl sm:p-8">
          {!loading && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
            >
              <X size={16} />
            </button>
          )}

          {done ? (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#B6F000]/15 text-[#B6F000]">
                <CheckCircle2 size={40} />
              </div>

              <h2 className="mt-6 text-2xl font-black text-white sm:text-3xl">
                {done.status === "ACTIVE"
                  ? "Membership Active!"
                  : "Plan Reserved!"}
              </h2>

              <p className="mt-2 text-sm text-white/55">
                {done.status === "ACTIVE"
                  ? "Payment successful. A confirmation email is on its way."
                  : "Pay cash/UPI at the venue to activate your plan. We'll email you once it's confirmed."}
              </p>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Membership #</span>
                  <span className="font-bold text-[#B6F000]">
                    {done.membershipNumber}
                  </span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="text-white/50">Plan</span>
                  <span className="font-semibold text-white">{done.plan.name}</span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="text-white/50">Valid</span>
                  <span className="font-semibold text-white">
                    {formatDate(done.startDate)} – {formatDate(done.endDate)}
                  </span>
                </div>
                <div className="mt-2 flex justify-between border-t border-white/10 pt-2">
                  <span className="text-white/50">Amount</span>
                  <span className="font-bold text-white">
                    ₹{Number(done.amount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="mt-6 w-full rounded-2xl bg-[#B6F000] px-6 py-3 font-bold text-black transition hover:brightness-110"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#B6F000]">
                Join Plan
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">{plan.name}</h2>
              <p className="mt-1 text-sm text-white/50">
                <span className="text-xl font-extrabold text-[#B6F000]">
                  ₹{price.toLocaleString("en-IN")}
                </span>{" "}
                / {plan.durationDays === 30 ? "month" : `${plan.durationDays} days`}
              </p>

              <div className="mt-6 grid gap-4">
                <input
                  className={inputClass}
                  placeholder={isAcademy ? "Parent / Guardian name" : "Full name"}
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  required
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    className={inputClass}
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    required
                  />
                  <input
                    className={inputClass}
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Mobile (10 digits)"
                    value={form.mobile}
                    onChange={(e) =>
                      update("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/50">
                    Start date
                  </label>
                  <input
                    className={inputClass}
                    type="date"
                    min={todayIso()}
                    value={form.startDate}
                    onChange={(e) => update("startDate", e.target.value)}
                    required
                  />
                </div>
                <textarea
                  className={`${inputClass} min-h-[72px] resize-none`}
                  placeholder={
                    isAcademy
                      ? "Child's name & age (e.g. Aarav, 9 yrs)"
                      : "Anything we should know? (optional)"
                  }
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  maxLength={500}
                />
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-medium text-white/50">Payment</p>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { value: "ONLINE", label: "Pay Online", hint: "UPI / Cards via Razorpay" },
                      { value: "PAY_AT_VENUE", label: "Pay at Venue", hint: "Cash / UPI on arrival" },
                    ] as const
                  ).map((option) => {
                    const selected = form.paymentMethod === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => update("paymentMethod", option.value)}
                        className={`rounded-xl border px-3 py-3 text-left transition ${
                          selected
                            ? "border-[#B6F000]/70 bg-[#B6F000]/10"
                            : "border-white/10 bg-white/[0.03] hover:border-white/25"
                        }`}
                      >
                        <p className={`text-sm font-semibold ${selected ? "text-[#B6F000]" : "text-white"}`}>
                          {option.label}
                        </p>
                        <p className="mt-0.5 text-[11px] text-white/35">{option.hint}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-2xl bg-[#B6F000] px-6 py-3.5 text-base font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Processing..."
                  : form.paymentMethod === "ONLINE"
                    ? `Pay ₹${price.toLocaleString("en-IN")}`
                    : "Reserve Plan"}
              </button>

              <p className="mt-4 text-center text-xs text-white/35">
                {form.paymentMethod === "ONLINE"
                  ? "Secure payment powered by Razorpay."
                  : "Plan activates once payment is collected at the venue."}
              </p>
            </form>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}
