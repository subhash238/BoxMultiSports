import SportsGrid from "@/components/sports/SportsGrid";

export default function SportsPage() {
  return (
    <main className="min-h-screen bg-[#050705] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#B6F000]">
          UniTurf Sports
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
          Choose Your Game.
          <br />
          Own Your Time.
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-white/60">
          Explore our courts, compare live pricing and book your preferred sport in just a few clicks.
        </p>

        <SportsGrid />
      </div>
    </main>
  );
}
