import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const authInputClass =
  "w-full rounded-xl border border-white/[0.10] bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#B6F000]/70 focus:ring-2 focus:ring-[#B6F000]/10";

export const authButtonClass =
  "mt-2 w-full rounded-xl bg-[#B6F000] py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60";

interface AuthShellProps {
  tagline: string;
  title: string;
  subtitle: string;
  icon?: ReactNode;
  backHref: string;
  backLabel: string;
  children: ReactNode;
}

/**
 * Dark UNITURF auth card used by login / forgot /
 * reset pages (customer + admin variants).
 */
export default function AuthShell({
  tagline,
  title,
  subtitle,
  icon,
  backHref,
  backLabel,
  children,
}: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050705] px-4">
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
                {tagline}
              </p>
            </div>
          </Link>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8">
          <div className="mb-7 text-center">
            {icon && (
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#B6F000]/15 text-[#B6F000]">
                {icon}
              </div>
            )}
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="mt-1.5 text-sm text-white/45">{subtitle}</p>
          </div>

          {children}
        </div>

        <div className="mt-6 text-center">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs text-white/40 transition hover:text-white"
          >
            <ArrowLeft size={13} />
            {backLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
