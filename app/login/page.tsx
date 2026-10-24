"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { Reveal } from "@/components/motion/Motion";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#050705]" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const safeRedirect =
    redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            scope: "customer",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Invalid email or password."
        );

        return;
      }

      if (!data.success) {
        setError(
          data.message ||
            "Login failed."
        );

        return;
      }

      const destination = safeRedirect ?? "/account";

      router.push(destination);
      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050705] px-4">
      {/* Background glow */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/3
          h-[420px]
          w-[640px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[#B6F000]/[0.06]
          blur-[120px]
        "
      />

      <Reveal immediate y={28} className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-3"
          >
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

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8">
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-bold text-white">
              Welcome Back
            </h1>
            <p className="mt-1.5 text-sm text-white/45">
              Sign in to see your bookings & memberships
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40"
              >
                Email
              </label>

              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/[0.10] bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#B6F000]/70 focus:ring-2 focus:ring-[#B6F000]/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-white/[0.10] bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#B6F000]/70 focus:ring-2 focus:ring-[#B6F000]/10"
                />
              </div>
            </div>

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-white/45 transition hover:text-[#B6F000]"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[#B6F000] py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/45">
            New here?{" "}
            <Link
              href={
                safeRedirect
                  ? `/register?redirect=${encodeURIComponent(safeRedirect)}`
                  : "/register"
              }
              className="font-semibold text-[#B6F000] hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/40 transition hover:text-white"
          >
            <ArrowLeft size={13} />
            Back to site
          </Link>
        </div>
      </Reveal>
    </main>
  );
}
