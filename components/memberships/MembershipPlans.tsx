"use client";

import { motion } from "framer-motion";
import { CalendarCheck, GraduationCap, Wallet } from "lucide-react";

const plans = [
  {
    icon: CalendarCheck,
    name: "Pickleball Membership",
    price: "₹3,000",
    period: "/month",
    description:
      "Unlimited pickleball access for the whole month. Perfect for regular players.",
    features: ["Unlimited play sessions", "Priority slot booking", "All days access"],
  },
  {
    icon: GraduationCap,
    name: "Kids Training Academy",
    price: "₹2,000",
    period: "/month",
    description:
      "Professional coaching for kids — cricket and football, every week.",
    features: [
      "Training 5 PM – 7 PM",
      "4 days Cricket / week",
      "2 days Football / week",
      "Certified coaches",
    ],
  },
];

export default function MembershipPlans() {
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
          young athletes.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#B6F000]/15 p-3 text-[#B6F000]">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-sm text-[#B6F000]">
                    <span className="text-2xl font-extrabold">{plan.price}</span>
                    <span className="text-white/50">{plan.period}</span>
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm text-white/60">{plan.description}</p>

              <ul className="mt-4 space-y-2">
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

              <a
                href="#booking"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[#B6F000] px-6 py-2.5 text-sm font-bold text-black transition hover:brightness-110"
              >
                Enquire Now
              </a>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-white/50">
        <Wallet size={16} className="text-[#B6F000]" />
        We accept <span className="font-semibold text-white">Cash</span> and
        <span className="font-semibold text-white">UPI</span> payments at the venue.
      </div>
    </section>
  );
}
