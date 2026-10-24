import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata = { title: "Admin Forgot Password | UniTurf" };

export default function AdminForgotPasswordPage() {
  return <ForgotPasswordForm scope="admin" />;
}
