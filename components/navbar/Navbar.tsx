"use client";

import Image from "next/image";
import Link from "next/link";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Sports", href: "/sports" },
  { name: "Yoga", href: "/yoga" },
  { name: "Gym", href: "/gym" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  return (
    <header className="fixed top-5 left-1/2 z-50 w-[95%] max-w-7xl -translate-x-1/2">
      <nav
        className="
          rounded-3xl
          border border-[#B6F000]/20
          bg-black/45
          backdrop-blur-2xl
          shadow-[0_12px_40px_rgba(182,240,0,0.15)]
          transition-all
          duration-300
        "
      >
        <div className="flex h-20 items-center justify-between px-8">

          {/* ================= Logo ================= */}

          <Link href="/" className="flex items-center gap-4">

            <Image
              src="/logo/logo.png"
              alt="UNI TURF"
              width={58}
              height={58}
              priority
              className="rounded-xl"
            />

            <div>

              <h1 className="text-2xl font-extrabold tracking-wide text-white">
                UNI <span className="text-[#B6F000]">TURF</span>
              </h1>

              <p className="text-xs uppercase tracking-[3px] text-gray-400">
                PLAY • IMPROVE • CONNECT
              </p>

            </div>

          </Link>

          {/* ================= Navigation ================= */}

          <ul className="hidden items-center gap-10 text-sm font-semibold lg:flex">

            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="
                    relative
                    text-white
                    transition-all
                    duration-300
                    hover:text-[#B6F000]
                    after:absolute
                    after:left-0
                    after:-bottom-2
                    after:h-[2px]
                    after:w-0
                    after:bg-[#B6F000]
                    after:transition-all
                    after:duration-300
                    hover:after:w-full
                  "
                >
                  {item.name}
                </Link>
              </li>
            ))}

          </ul>

          {/* ================= CTA ================= */}

          <Link
            href="/booking"
            className="
              rounded-2xl
              bg-[#B6F000]
              px-7
              py-3
              font-semibold
              text-black
              transition-all
              duration-300
              hover:scale-105
              hover:bg-[#C8FF1A]
              hover:shadow-[0_0_30px_rgba(182,240,0,0.45)]
            "
          >
            Book Now
          </Link>

        </div>
      </nav>
    </header>
  );
}
