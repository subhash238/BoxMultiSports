import YogaBookingWidget from "@/components/yoga/YogaBookingWidget";

export default function YogaPage() {
  return (
    <main className="min-h-screen bg-[#050705] px-6 py-24 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#B6F000]">
          UniTurf Yoga
        </p>
        <h1 className="mt-4 text-4xl font-black md:text-6xl">
          Move with intention.
        </h1>
        <p className="mt-5 max-w-2xl text-white/60">
          Reserve your Yoga session in the early morning window and complete payment securely online.
        </p>
        <YogaBookingWidget />
      </div>
    </main>
  );
}
