import UserList from "@/components/admin/users/UserList";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          Registered customers and admins. Promote a customer to admin from here.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-4 sm:p-6">
        <UserList />
      </div>
    </div>
  );
}
