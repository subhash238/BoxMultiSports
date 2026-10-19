"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, ShieldCheck } from "lucide-react";

import AuthShell, { authButtonClass, authInputClass } from "./AuthShell";

interface Props {
  scope: "customer" | "admin";
}

export default function ResetPasswordForm({ scope }: Props) {
  const isAdmin = scope === "admin";
  const loginHref = isAdmin ? "/admin/login" : "/login";
  const forgotHref = isAdmin ? "/admin/forgot-password" : "/forgot-password";

  const token = useSearchParams().get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, scope }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(data?.message || "Unable to reset password. Please try again.");
        return;
      }

      setDone(true);
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  const tagline = isAdmin ? "Admin Console" : "Play · Improve · Connect";

  if (!token) {
    return (
      <AuthShell
        tagline={tagline}
        title="Invalid Link"
        subtitle="This reset link is missing or malformed"
        icon={<ShieldCheck size={20} />}
        backHref={loginHref}
        backLabel="Back to sign in"
      >
        <p className="text-center text-sm text-white/60">
          Please request a new link from the{" "}
          <Link href={forgotHref} className="font-semibold text-[#B6F000] hover:underline">
            forgot password
          </Link>{" "}
          page.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      tagline={tagline}
      title="Set New Password"
      subtitle="Choose a strong password for your account"
      icon={<ShieldCheck size={20} />}
      backHref={loginHref}
      backLabel="Back to sign in"
    >
      {done ? (
        <div className="space-y-5 text-center">
          <div className="rounded-xl border border-[#B6F000]/25 bg-[#B6F000]/[0.08] px-4 py-4 text-sm text-[#B6F000]">
            Password updated successfully.
          </div>
          <Link
            href={loginHref}
            className="inline-block w-full rounded-xl bg-[#B6F000] py-3 text-sm font-bold text-black transition hover:brightness-110"
          >
            Sign In
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}{" "}
              {error.toLowerCase().includes("expired") && (
                <Link href={forgotHref} className="font-semibold underline">
                  Request a new link
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
                New Password
              </label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className={authInputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="confirm-password"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className={authInputClass}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className={authButtonClass}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
