import {
  Bell,
  Search,
  UserCircle,
} from "lucide-react";

export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      {/* Left */}
      <div>
        <h1 className="text-xl font-semibold">
          Dashboard
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="hidden items-center rounded-lg border px-3 py-2 md:flex">
          <Search
            size={18}
            className="mr-2 text-gray-500"
          />

          <input
            type="text"
            placeholder="Search..."
            className="outline-none"
          />
        </div>

        {/* Notification */}
        <button className="rounded-full p-2 hover:bg-gray-100">
          <Bell size={20} />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100">
          <UserCircle size={30} />

          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold">
              Admin
            </p>

            <p className="text-xs text-gray-500">
              Administrator
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}