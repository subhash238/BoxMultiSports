"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Mail, ShieldCheck } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-white/[0.10] bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#B6F000]/70 focus:ring-2 focus:ring-[#B6F000]/10";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      if (data.user?.role !== "ADMIN") {
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
        setError("This account does not have admin access.");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050705] px-4">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B6F000]/[0.06] blur-[120px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#B6F000] text-sm font-extrabold text-black">
              UT
            </div>
            <div className="text-left">
              <p className="text-lg font-extrabold tracking-wide text-white">
                UNI<span className="text-[#B6F000]">TURF</span>
              </p>
              <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/40">
                Admin Console
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#B6F000]/15 text-[#B6F000]">
              <ShieldCheck size={20} />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="mt-1.5 text-sm text-white/45">Restricted — staff access only</p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@uniturff.com"
                  required
                  autoComplete="username"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  className={inputClass}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[#B6F000] py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-white/40 transition hover:text-white">
            <ArrowLeft size={13} />
            Back to site
          </Link>
        </div>
      </div>
    </main>
  );
}
