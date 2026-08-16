interface RecentBookingsProps {
  bookings: {
    id: string;
    bookingNumber: string;
    totalAmount: unknown;
    status: string;
    user: {
      name: string;
    };
    sport: {
      name: string;
    };
  }[];
}

export default function RecentBookings({
  bookings,
}: RecentBookingsProps) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b p-6">
        <h2 className="text-lg font-semibold">
          Recent Bookings
        </h2>
      </div>

      <div className="divide-y">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="flex items-center justify-between p-4"
          >
            <div>
              <p className="font-medium">
                {booking.bookingNumber}
              </p>

              <p className="text-sm text-gray-500">
                {booking.user.name} • {booking.sport.name}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold">
                ₹{Number(booking.totalAmount)}
              </p>

              <p className="text-sm text-gray-500">
                {booking.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}