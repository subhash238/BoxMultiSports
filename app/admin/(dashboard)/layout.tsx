import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import DashboardLayout from "@/components/admin/layout/DashboardLayout";

import jwt from "jsonwebtoken";

import { AUTH_COOKIE_NAMES } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface AdminLayoutProps {
  children: ReactNode;
}

interface AuthPayload {
  id: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
}

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(AUTH_COOKIE_NAMES.admin)?.value;

  if (!token) {
    redirect("/admin/login");
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AuthPayload;

    if (payload.role !== "ADMIN") {
      redirect("/admin/login");
    }
  } catch {
    redirect("/admin/login");
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}