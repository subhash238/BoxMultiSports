import type { Metadata } from "next";

import AccountDashboard from "@/components/account/AccountDashboard";

export const metadata: Metadata = {
  title: "My Account | UNITURF",
  description: "Your bookings and memberships at UNITURF.",
};

export default function AccountPage() {
  return <AccountDashboard />;
}
