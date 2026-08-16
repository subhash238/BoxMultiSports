import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import DashboardLayout from "@/components/admin/layout/DashboardLayout";

import jwt from "jsonwebtoken";

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
    cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AuthPayload;

    if (payload.role !== "ADMIN") {
      redirect("/");
    }
  } catch {
    redirect("/login");
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}