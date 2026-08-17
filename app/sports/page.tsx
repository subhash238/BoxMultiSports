import SportsGrid from "@/components/sports/SportsGrid";

export default function SportsPage() {
  return (
    <main className="min-h-screen bg-[#050705] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black md:text-6xl">
          Sports
        </h1>

        <p className="mt-4 max-w-2xl text-white/60">
          Choose your game and explore live pricing from UniTurf.
        </p>

        <SportsGrid />
      </div>
    </main>
  );
}
