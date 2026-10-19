"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { KeyRound, Mail } from "lucide-react";

import AuthShell, { authButtonClass, authInputClass } from "./AuthShell";

interface Props {
  scope: "customer" | "admin";
}

export default function ForgotPasswordForm({ scope }: Props) {
  const isAdmin = scope === "admin";
  const loginHref = isAdmin ? "/admin/login" : "/login";

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, scope }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(data?.message || "Something went wrong. Please try again.");
        return;
      }

      setSent(true);
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      tagline={isAdmin ? "Admin Console" : "Play · Improve · Connect"}
      title="Forgot Password"
      subtitle="Enter your email and we'll send you a reset link"
      icon={<KeyRound size={20} />}
      backHref={loginHref}
      backLabel="Back to sign in"
    >
      {sent ? (
        <div className="space-y-5 text-center">
          <div className="rounded-xl border border-[#B6F000]/25 bg-[#B6F000]/[0.08] px-4 py-4 text-sm text-[#B6F000]">
            If an account exists for <span className="font-semibold">{email}</span>,
            a reset link is on its way. Check your inbox (and spam) — the link
            is valid for 30 minutes.
          </div>
          <Link href={loginHref} className="inline-block text-sm font-semibold text-[#B6F000] hover:underline">
            Return to sign in
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className={authInputClass}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className={authButtonClass}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
