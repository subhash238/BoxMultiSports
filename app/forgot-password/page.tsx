import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata = { title: "Forgot Password | UniTurf" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm scope="customer" />;
}
