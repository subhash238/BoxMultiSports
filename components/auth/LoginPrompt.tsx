"use client";

import Link from "next/link";
import { LockKeyhole, X } from "lucide-react";

import ModalPortal from "@/components/booking-widget/ModalPortal";

interface LoginPromptProps {
  title?: string;
  message?: string;
  redirectTo: string;
  onClose: () => void;
}

export default function LoginPrompt({
  title = "Sign in to continue",
  message = "Create a free account or sign in to book — you'll be able to track all your bookings and memberships in one place.",
  redirectTo,
  onClose,
}: LoginPromptProps) {
  const redirect = encodeURIComponent(redirectTo);

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-prompt-title"
      >
        <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0d120d] p-7 text-center shadow-2xl">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <X size={16} />
          </button>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#B6F000]/15 text-[#B6F000]">
            <LockKeyhole size={26} />
          </div>

          <h2 id="login-prompt-title" className="mt-5 text-xl font-black text-white">
            {title}
          </h2>
          <p className="mt-2 text-sm text-white/55">{message}</p>

          <div className="mt-6 grid gap-3">
            <Link
              href={`/login?redirect=${redirect}`}
              className="rounded-2xl bg-[#B6F000] px-6 py-3 text-sm font-bold text-black transition hover:brightness-110"
            >
              Sign In
            </Link>
            <Link
              href={`/register?redirect=${redirect}`}
              className="rounded-2xl border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#B6F000]/60 hover:text-[#B6F000]"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
