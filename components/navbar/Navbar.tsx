export default function Navbar() {
  return (
    <nav className="w-full bg-slate-900 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">

        {/* Logo */}
        <div>
          <h1 className="text-3xl font-bold text-orange-500">
            BOX
          </h1>
          <p className="text-sm text-gray-300">
            Multisports Activity
          </p>
        </div>

        {/* Navigation Menu */}
        <ul className="hidden md:flex items-center gap-8 font-medium">

          <li>
            <a href="#" className="transition hover:text-orange-400">
              Home
            </a>
          </li>

          <li>
            <a href="#" className="transition hover:text-orange-400">
              Sports
            </a>
          </li>

          <li>
            <a href="#" className="transition hover:text-orange-400">
              Facilities
            </a>
          </li>

          <li>
            <a href="#" className="transition hover:text-orange-400">
              Gallery
            </a>
          </li>

          <li>
            <a href="#" className="transition hover:text-orange-400">
              Pricing
            </a>
          </li>

          <li>
            <a href="#" className="transition hover:text-orange-400">
              Contact
            </a>
          </li>

        </ul>

        {/* Book Button */}
        <button className="rounded-lg bg-orange-500 px-6 py-3 font-semibold transition hover:bg-orange-600">
          Book Now
        </button>

      </div>
    </nav>
  );
}             