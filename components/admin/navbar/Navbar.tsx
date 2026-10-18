"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  Menu,
  Shield,
} from "lucide-react";

const titles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/sports": "Sports",
  "/admin/bookings": "Bookings",
  "/admin/users": "Users",
};

interface NavbarProps {
  onMenuToggle: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [lastPathname, setLastPathname] =
    useState(pathname);
  const menuRef = useRef<HTMLDivElement>(null);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  const title =
    Object.entries(titles).find(
      ([href]) =>
        pathname === href || pathname.startsWith(`${href}/`)
    )?.[1] ?? "Admin";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/[0.06] bg-white/85 px-4 backdrop-blur-md sm:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
          className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-lg font-bold text-gray-900">
          {title}
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full bg-[#B6F000]/15 px-3 py-1 text-xs font-semibold text-[#5a7a00] sm:inline-flex">
          <Shield size={13} />
          Admin
        </span>

        {/* Profile dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Account menu"
            className="flex items-center gap-1.5 rounded-full p-1 pr-2 hover:bg-gray-100"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a0f0a] text-sm font-bold text-[#B6F000]">
              A
            </div>
            <ChevronDown
              size={15}
              className={`text-gray-500 transition-transform ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 w-44 overflow-hidden rounded-xl border border-black/[0.06] bg-white py-1 shadow-lg">
              <div className="border-b border-black/[0.06] px-4 py-2.5">
                <p className="text-sm font-semibold text-gray-900">
                  Admin
                </p>
                <p className="text-xs text-gray-400">
                  Administrator
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
