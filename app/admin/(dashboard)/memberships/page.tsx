import MembershipList from "@/components/admin/memberships/MembershipList";

export default function MembershipsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Memberships</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monthly plans — Pickleball membership and Kids Academy.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-4 sm:p-6">
        <MembershipList />
      </div>
    </div>
  );
}
