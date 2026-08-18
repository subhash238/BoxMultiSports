"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Sports", href: "/sports" },
  { name: "Yoga", href: "/yoga" },
  { name: "Gym", href: "/gym" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/admin") || pathname === "/login") {
    return null;
  }

  return (
    <header className="fixed left-1/2 top-3 z-50 w-[calc(100%-1.5rem)] max-w-7xl -translate-x-1/2 lg:top-5 lg:w-[95%]">
      <nav className="rounded-3xl border border-[#B6F000]/20 bg-black/45 shadow-[0_12px_40px_rgba(182,240,0,0.15)] backdrop-blur-2xl transition-all duration-300">
        <div className="flex h-16 items-center justify-between gap-2 px-4 sm:px-6 lg:h-20 lg:px-8">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex min-w-0 shrink items-center gap-2 sm:gap-4"
          >
            <Image
              src="/logo/logo.png"
              alt="UNI TURF"
              width={58}
              height={58}
              priority
              className="h-11 w-11 rounded-xl lg:h-[58px] lg:w-[58px]"
            />
            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold tracking-wide text-white lg:text-2xl">
                UNI <span className="text-[#B6F000]">TURF</span>
              </h1>
              <p className="hidden text-xs uppercase tracking-[3px] text-gray-400 sm:block">
                PLAY · IMPROVE · CONNECT
              </p>
            </div>
          </Link>

          <ul className="hidden items-center gap-10 text-sm font-semibold lg:flex">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="relative text-white transition-all duration-300 hover:text-[#B6F000] after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:w-0 after:bg-[#B6F000] after:transition-all after:duration-300 hover:after:w-full"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/booking"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl bg-[#B6F000] px-3 py-2 text-xs font-semibold text-black transition-all duration-300 hover:scale-105 hover:bg-[#C8FF1A] hover:shadow-[0_0_30px_rgba(182,240,0,0.45)] sm:px-4 lg:rounded-2xl lg:px-7 lg:py-3 lg:text-base"
            >
              Book Now
            </Link>
            <button
              type="button"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-white transition hover:border-[#B6F000]/60 hover:text-[#B6F000] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B6F000] lg:hidden"
            >
              <span className="sr-only">Toggle navigation</span>
              <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
                <span className={`h-0.5 w-full bg-current transition ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
                <span className={`h-0.5 w-full bg-current transition ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`h-0.5 w-full bg-current transition ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {menuOpen ? (
            <motion.div
              id="mobile-navigation"
              role="navigation"
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-white/10 lg:hidden"
            >
              <div className="grid gap-1 px-3 pb-3 pt-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-white transition hover:bg-white/[0.08] hover:text-[#B6F000] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B6F000]"
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  href="/booking"
                  onClick={() => setMenuOpen(false)}
                  className="mt-1 flex min-h-11 items-center justify-center rounded-xl bg-[#B6F000] px-4 text-sm font-bold text-black transition hover:bg-[#C8FF1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B6F000] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  Book Now
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </nav>
    </header>
  );
}
