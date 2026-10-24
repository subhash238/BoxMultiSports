import { Suspense } from "react";

import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "Admin Reset Password | UniTurf" };

export default function AdminResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#050705]" />}>
      <ResetPasswordForm scope="admin" />
    </Suspense>
  );
}
