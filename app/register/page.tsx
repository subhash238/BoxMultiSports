"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Mail, Phone, User } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-white/[0.10] bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#B6F000]/70 focus:ring-2 focus:ring-[#B6F000]/10";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          mobile: form.mobile.replace(/\D/g, ""),
          password: form.password,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        const fieldError = data.errors
          ? (Object.values(data.errors).flat()[0] as string | undefined)
          : undefined;
        setError(data.message || fieldError || "Unable to create account.");
        return;
      }

      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });

      if (!loginRes.ok) {
        router.push("/login?redirect=/account");
        return;
      }

      router.push("/account");
      router.refresh();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050705] px-4 py-10">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B6F000]/[0.06] blur-[120px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#B6F000] text-sm font-extrabold text-black">
              UT
            </div>
            <div className="text-left">
              <p className="text-lg font-extrabold tracking-wide text-white">
                UNI<span className="text-[#B6F000]">TURF</span>
              </p>
              <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/40">
                Play · Improve · Connect
              </p>
            </div>
          </Link>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8">
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
            <p className="mt-1.5 text-sm text-white/45">
              Track your bookings and memberships in one place
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full name" icon={<User size={16} />}>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Your name"
                required
                minLength={3}
                autoComplete="name"
              />
            </Field>
            <Field label="Mobile" icon={<Phone size={16} />}>
              <input
                className={inputClass}
                type="tel"
                inputMode="numeric"
                value={form.mobile}
                onChange={(e) =>
                  update("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="10-digit mobile"
                required
                minLength={10}
                autoComplete="tel"
              />
            </Field>
            <Field label="Email" icon={<Mail size={16} />}>
              <input
                className={inputClass}
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </Field>
            <Field label="Password" icon={<Lock size={16} />}>
              <input
                className={inputClass}
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[#B6F000] py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/45">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#B6F000] hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/40 transition hover:text-white"
          >
            <ArrowLeft size={13} />
            Back to site
          </Link>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}
