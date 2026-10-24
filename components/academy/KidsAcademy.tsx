"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Clock,
  CalendarDays,
  IndianRupee,
  Users,
  Send,
} from "lucide-react";

const WHATSAPP_BASE_URL = "https://wa.me/919031017884";

export const KIDS_ACADEMY = {
  planSlug: "kids-academy-monthly",
  ageRange: "5 to 12 years",
  fee: 2000,
  timing: "5 PM - 7 PM, every day",
  schedule: [
    { sport: "Cricket", days: 4 },
    { sport: "Football", days: 3 },
    { sport: "Pickleball", days: 1 },
  ],
} as const;

const AGE_OPTIONS = Array.from({ length: 8 }, (_, i) => 5 + i);

export default function KidsAcademy() {
  const [showForm, setShowForm] = useState(false);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [parentName, setParentName] = useState("");
  const [mobile, setMobile] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const trimmedChild = childName.trim();
    const trimmedParent = parentName.trim();
    const trimmedMobile = mobile.trim();

    if (trimmedChild.length < 2) {
      setError("Please enter the child's name.");
      return;
    }
    if (!childAge) {
      setError("Please select the child's age.");
      return;
    }
    if (trimmedParent.length < 2) {
      setError("Please enter the parent/guardian name.");
      return;
    }
    if (!/^\+?[0-9][0-9 -]{8,14}$/.test(trimmedMobile)) {
      setError("Please enter a valid mobile number.");
      return;
    }

    const message = [
      "Kids Academy admission enquiry",
      `Child: ${trimmedChild} (${childAge} years)`,
      `Parent/Guardian: ${trimmedParent}`,
      `Plan: Kids Academy - Rs ${KIDS_ACADEMY.fee}/month, ${KIDS_ACADEMY.timing}`,
    ].join("\n");

    setSending(true);
    let emailed = false;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedParent,
          mobile: trimmedMobile,
          message,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 429) {
        setSending(false);
        setError(
          data?.message ||
            "Too many requests. Please try again in a few minutes."
        );
        return;
      }
      emailed = Boolean(res.ok && data?.emailed);
    } catch {
      emailed = false;
    }
    setSending(false);

    setSuccess(
      emailed
        ? "Admission request sent! We'll call you shortly. Opening WhatsApp too…"
        : "Opening WhatsApp so you can send your admission request…"
    );
    if (emailed) {
      setChildName("");
      setChildAge("");
      setParentName("");
      setMobile("");
    }

    const whatsappText = [
      "Hello UniTurf,",
      "",
      `I want to admit my child to the Kids Academy.`,
      "",
      `Child: ${trimmedChild} (${childAge} years)`,
      `Parent/Guardian: ${trimmedParent}`,
      `Mobile: ${trimmedMobile}`,
    ].join("\n");

    window.open(
      `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(whatsappText)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <section
      id="academy"
      className="relative isolate scroll-mt-28 overflow-hidden bg-[#050705] px-4 py-14 sm:px-6 sm:py-16"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-[#B6F000]/[0.06] blur-[140px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[#B6F000]/30 bg-gradient-to-br from-[#B6F000]/[0.12] via-white/[0.04] to-transparent p-6 sm:p-10"
      >
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#B6F000] px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.25em] text-black">
              <span className="h-2 w-2 animate-pulse rounded-full bg-black" />
              Admission Open Now
            </span>

            <h2 className="mt-5 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              Kids Sports <span className="text-[#B6F000]">Academy</span>
            </h2>
            <p className="mt-2 text-base font-semibold text-white/80">
              For children aged {KIDS_ACADEMY.ageRange}
            </p>
            <p className="mt-3 max-w-xl text-sm text-white/60">
              Daily coaching in cricket, football and pickleball with certified
              coaches. Build skills, fitness and confidence — every evening on
              the turf.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InfoTile
                icon={<IndianRupee size={18} />}
                label="Monthly Fee"
                value={`₹${KIDS_ACADEMY.fee.toLocaleString("en-IN")} / month`}
              />
              <InfoTile
                icon={<Clock size={18} />}
                label="Timing"
                value="5 PM – 7 PM"
                sub="Every day"
              />
              <InfoTile
                icon={<Users size={18} />}
                label="Age Group"
                value="5 – 12 years"
              />
            </div>

            <div className="mt-5">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                <CalendarDays size={14} className="text-[#B6F000]" />
                Weekly Schedule
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {KIDS_ACADEMY.schedule.map((item) => (
                  <span
                    key={item.sport}
                    className="rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1.5 text-sm text-white/85"
                  >
                    <span className="font-bold text-[#B6F000]">{item.days}</span>{" "}
                    {item.days === 1 ? "day" : "days"} {item.sport}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowForm((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full bg-[#B6F000] px-6 py-3 text-sm font-bold text-black transition hover:brightness-110"
              >
                <GraduationCap size={18} />
                Apply for Admission
              </button>
              <Link
                href={`/?join=${KIDS_ACADEMY.planSlug}#memberships`}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#B6F000]/60 hover:text-[#B6F000]"
              >
                Join &amp; Pay Online
              </Link>
            </div>
          </div>

          <div
            className={`rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-sm sm:p-6 ${
              showForm ? "" : "hidden lg:block"
            }`}
          >
            <h3 className="text-lg font-bold text-white">Admission Form</h3>
            <p className="mt-1 text-xs text-white/50">
              Fill this and we&apos;ll call you back. Or walk in any day, 5–7 PM.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Child's name"
                maxLength={100}
                className={inputClass}
              />
              <select
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                className={inputClass}
              >
                <option value="" className="bg-[#0a0f0a]">
                  Child&apos;s age
                </option>
                {AGE_OPTIONS.map((age) => (
                  <option key={age} value={age} className="bg-[#0a0f0a]">
                    {age} years
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Parent / guardian name"
                maxLength={100}
                className={inputClass}
              />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Mobile number"
                maxLength={16}
                className={inputClass}
              />

              {error && <p className="text-sm text-red-400">{error}</p>}
              {success && <p className="text-sm text-[#B6F000]">{success}</p>}

              <button
                type="submit"
                disabled={sending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#B6F000] px-6 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-60"
              >
                <Send size={16} />
                {sending ? "Sending…" : "Send Admission Request"}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[#B6F000]/60";

function InfoTile({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="flex items-center gap-2 text-[#B6F000]">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
          {label}
        </span>
      </div>
      <p className="mt-2 text-lg font-extrabold text-white">{value}</p>
      {sub && <p className="text-xs text-white/50">{sub}</p>}
    </div>
  );
}
