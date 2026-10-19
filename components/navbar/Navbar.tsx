"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { UserRound } from "lucide-react";
import BookNowTrigger from "@/components/booking-widget/BookNowTrigger";

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
  const isNavItemActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };
  const dedicatedBookingHref =
    pathname === "/yoga"
      ? "/yoga#yoga-booking"
      : pathname === "/gym"
        ? "/gym#gym-booking"
        : null;
  const [menuOpen, setMenuOpen] = useState(false);
  const [authState, setAuthState] = useState<"unknown" | "guest" | "user">("unknown");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => {
        if (!cancelled) setAuthState(res.ok ? "user" : "guest");
      })
      .catch(() => {
        if (!cancelled) setAuthState("guest");
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const accountHref = authState === "user" ? "/account" : "/login";
  const accountLabel = authState === "user" ? "My Account" : "Login";
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  if (
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return null;
  }

  return (
    <header className="fixed left-1/2 top-3 z-50 w-[calc(100%-1.5rem)] max-w-6xl -translate-x-1/2 lg:top-4 lg:w-[92%]">
      <nav
        className={`rounded-full border backdrop-blur-2xl transition-all duration-500 ${
          scrolled || menuOpen
            ? "border-white/10 bg-[#050705]/85 shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
            : "border-white/[0.08] bg-[#050705]/50 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
        }`}
      >
        <div className="flex h-14 items-center justify-between gap-3 pl-4 pr-2 sm:pl-5 lg:h-[60px] lg:pr-2.5">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex min-w-0 shrink items-center gap-2.5"
          >
            <Image
              src="/logo/logo.png"
              alt="UNI TURF"
              width={40}
              height={40}
              priority
              className="h-9 w-9 rounded-lg lg:h-10 lg:w-10"
            />
            <div className="min-w-0 leading-none">
              <span className="block text-base font-extrabold tracking-wide text-white lg:text-lg">
                UNI<span className="text-[#B6F000]">TURF</span>
              </span>
              <span className="mt-1 hidden text-[9px] font-medium uppercase tracking-[0.28em] text-white/40 sm:block">
                Play · Improve · Connect
              </span>
            </div>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const isActive = isNavItemActive(item.href);

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative rounded-full px-4 py-2 text-[13px] font-medium tracking-wide transition-all duration-300 ${
                      isActive
                        ? "text-[#B6F000]"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {item.name}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-4 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-[#B6F000] to-transparent transition-opacity duration-300 ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={accountHref}
              aria-label={accountLabel}
              onClick={() => setMenuOpen(false)}
              className={`hidden h-10 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition lg:inline-flex ${
                pathname === "/account"
                  ? "border-[#B6F000]/60 text-[#B6F000]"
                  : "border-white/15 bg-white/[0.05] text-white/80 hover:border-[#B6F000]/60 hover:text-[#B6F000]"
              }`}
            >
              <UserRound size={15} />
              {accountLabel}
            </Link>
            {dedicatedBookingHref ? (
              <Link
                href={dedicatedBookingHref}
                onClick={() => setMenuOpen(false)}
                className="rounded-full bg-[#B6F000] px-4 py-2 text-[13px] font-bold text-[#050705] transition-all duration-300 hover:-translate-y-px hover:bg-[#C8FF1A] hover:shadow-[0_0_28px_rgba(182,240,0,0.45)] sm:px-5 lg:px-6 lg:py-2.5"
              >
                Book Now
              </Link>
            ) : (
              <BookNowTrigger
                onClick={() => setMenuOpen(false)}
                className="rounded-full bg-[#B6F000] px-4 py-2 text-[13px] font-bold text-[#050705] transition-all duration-300 hover:-translate-y-px hover:bg-[#C8FF1A] hover:shadow-[0_0_28px_rgba(182,240,0,0.45)] sm:px-5 lg:px-6 lg:py-2.5"
              >
                Book Now
              </BookNowTrigger>
            )}
            <button
              ref={mobileMenuToggleRef}
              type="button"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-white transition hover:border-[#B6F000]/60 hover:text-[#B6F000] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B6F000] lg:hidden"
            >
              <span className="sr-only">Toggle navigation</span>
              <span className="flex w-[18px] flex-col gap-[5px]" aria-hidden="true">
                <span className={`h-[1.5px] w-full bg-current transition ${menuOpen ? "translate-y-[6.5px] rotate-45" : ""}`} />
                <span className={`h-[1.5px] w-full bg-current transition ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`h-[1.5px] w-full bg-current transition ${menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
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
              className="overflow-hidden rounded-b-[28px] border-t border-white/10 lg:hidden"
            >
              <div className="grid gap-1 px-3 pb-3 pt-2">
                {navItems.map((item) => {
                  const isActive = isNavItemActive(item.href);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setMenuOpen(false)}
                      className={`flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B6F000] ${
                        isActive
                          ? "bg-white/[0.08] text-[#B6F000]"
                          : "text-white hover:bg-white/[0.08] hover:text-[#B6F000]"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
                <Link
                  href={accountHref}
                  onClick={() => setMenuOpen(false)}
                  className={`flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B6F000] ${
                    pathname === "/account"
                      ? "bg-white/[0.08] text-[#B6F000]"
                      : "text-white hover:bg-white/[0.08] hover:text-[#B6F000]"
                  }`}
                >
                  <UserRound size={16} />
                  {accountLabel}
                </Link>
                {dedicatedBookingHref ? (
                  <Link
                    href={dedicatedBookingHref}
                    onClick={() => setMenuOpen(false)}
                    className="mt-1 flex min-h-11 items-center justify-center rounded-xl bg-[#B6F000] px-4 text-sm font-bold text-black transition hover:bg-[#C8FF1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B6F000] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    Book Now
                  </Link>
                ) : (
                  <BookNowTrigger
                    onClick={() => setMenuOpen(false)}
                    focusFallbackRef={mobileMenuToggleRef}
                    className="mt-1 flex min-h-11 items-center justify-center rounded-xl bg-[#B6F000] px-4 text-sm font-bold text-black transition hover:bg-[#C8FF1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B6F000] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    Book Now
                  </BookNowTrigger>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </nav>
    </header>
  );
}
