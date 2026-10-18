"use client";

import { usePathname } from "next/navigation";
import { Menu, Shield } from "lucide-react";

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

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a0f0a] text-sm font-bold text-[#B6F000]">
          A
        </div>
      </div>
    </header>
  );
}
