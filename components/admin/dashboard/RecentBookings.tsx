interface RecentBooking {
  id: string;
  bookingNumber: string;
  totalAmount: number;
  status: string;
  user: {
    name: string;
  };
  sport: {
    name: string;
  };
}

interface RecentBookingsProps {
  bookings: RecentBooking[];
}

/**
 * ==========================================
 * Recent Bookings
 * ==========================================
 */
export default function RecentBookings({
  bookings,
}: RecentBookingsProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Recent Bookings
          </h2>

          <p className="text-sm text-gray-500">
            Latest booking activity
          </p>
        </div>
      </div>

      {/* Empty State */}
      {bookings.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-500">
          No recent bookings found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="pb-3 font-medium">
                  Booking
                </th>

                <th className="pb-3 font-medium">
                  Customer
                </th>

                <th className="pb-3 font-medium">
                  Sport
                </th>

                <th className="pb-3 font-medium">
                  Amount
                </th>

                <th className="pb-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b last:border-0"
                >
                  <td className="py-4 font-medium">
                    {booking.bookingNumber}
                  </td>

                  <td className="py-4">
                    {booking.user.name}
                  </td>

                  <td className="py-4">
                    {booking.sport.name}
                  </td>

                  <td className="py-4">
                    ₹{booking.totalAmount.toLocaleString("en-IN")}
                  </td>

                  <td className="py-4">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}