"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, GraduationCap, Wallet } from "lucide-react";

import LoginPrompt from "@/components/auth/LoginPrompt";
import { useAuthUser } from "@/lib/client/useAuthUser";

import MembershipModal from "./MembershipModal";

export interface MembershipPlan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: string | number;
  durationDays: number;
  features: string[];
}

function planIcon(slug: string) {
  return slug.includes("academy") || slug.includes("kids")
    ? GraduationCap
    : CalendarCheck;
}

export default function MembershipPlans() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<MembershipPlan | null>(null);
  const [loginFor, setLoginFor] = useState<MembershipPlan | null>(null);
  const { status: authStatus } = useAuthUser();

  const handleJoin = (plan: MembershipPlan) => {
    if (authStatus !== "authenticated") {
      setLoginFor(plan);
      return;
    }
    setSelected(plan);
  };

  useEffect(() => {
    let cancelled = false;

    fetch("/api/memberships/plans")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.success) {
          setPlans(data.plans ?? []);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated" || plans.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("join");
    if (!slug) return;
    params.delete("join");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
    );
    const plan = plans.find((p) => p.slug === slug);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (plan) setSelected(plan);
  }, [authStatus, plans]);

  if (loaded && plans.length === 0) {
    return null;
  }

  return (
    <section id="memberships" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8FBF00]">
          Memberships & Academy
        </p>
        <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
          Monthly <span className="text-[#B6F000]">Plans</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/50">
          Train more, pay less. Monthly memberships for regular players and
          young athletes — book and pay online in a minute.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {!loaded &&
          [0, 1].map((i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
            />
          ))}

        {plans.map((plan) => {
          const Icon = planIcon(plan.slug);
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#B6F000]/15 p-3 text-[#B6F000]">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-sm text-[#B6F000]">
                    <span className="text-2xl font-extrabold">
                      ₹{Number(plan.price).toLocaleString("en-IN")}
                    </span>
                    <span className="text-white/50">
                      {plan.durationDays === 30
                        ? "/month"
                        : ` / ${plan.durationDays} days`}
                    </span>
                  </p>
                </div>
              </div>

              {plan.description && (
                <p className="mt-4 text-sm text-white/60">{plan.description}</p>
              )}

              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-white/70"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#B6F000]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleJoin(plan)}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[#B6F000] px-6 py-2.5 text-sm font-bold text-black transition hover:brightness-110"
              >
                Join Now
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-white/50">
        <Wallet size={16} className="text-[#B6F000]" />
        Pay online (UPI / Cards) or with
        <span className="font-semibold text-white">Cash</span> /
        <span className="font-semibold text-white">UPI</span> at the venue.
      </div>

      {loginFor && (
        <LoginPrompt
          title="Sign in to join"
          message="Sign in or create a free account to buy a monthly plan and track its validity in My Account."
          redirectTo={`/?join=${encodeURIComponent(loginFor.slug)}#memberships`}
          onClose={() => setLoginFor(null)}
        />
      )}

      {selected && (
        <MembershipModal plan={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
