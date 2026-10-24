import BookingList from "@/components/admin/bookings/BookingList";

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Bookings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage all customer bookings.
        </p>
      </div>

      {/* Booking List */}
      <div className="rounded-xl border bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            All Bookings
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            View and manage customer bookings.
          </p>
        </div>

        <BookingList />
      </div>
    </div>
  );
}