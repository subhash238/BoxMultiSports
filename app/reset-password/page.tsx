import { Suspense } from "react";

import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "Reset Password | UniTurf" };

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#050705]" />}>
      <ResetPasswordForm scope="customer" />
    </Suspense>
  );
}
