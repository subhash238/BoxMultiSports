"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";

/**
 * Public chrome (navbar + footer) rendered on
 * every page except /admin, which has its own
 * shell.
 */
export default function Chrome({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  if (
    pathname.startsWith("/admin") ||
    pathname === "/login"
  ) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <div className="public-page-shell flex-1">
        {children}
      </div>
      <Footer />
    </>
  );
}
