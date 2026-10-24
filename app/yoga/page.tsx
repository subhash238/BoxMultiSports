import YogaBookingWidget from "@/components/yoga/YogaBookingWidget";
import {
  Reveal,
  Stagger,
  StaggerItem,
  TextReveal,
  FloatingBlob,
} from "@/components/motion/Motion";

type PexelsYogaPhoto = {
  src?: {
    large2x?: string;
    landscape?: string;
    large?: string;
  };
};

async function getYogaHeroImage(): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      "https://api.pexels.com/v1/photos/8436610",
      {
        headers: {
          Authorization: apiKey,
        },
        next: {
          revalidate: 86400,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const photo = (await response.json()) as PexelsYogaPhoto;

    return (
      photo.src?.large2x ??
      photo.src?.landscape ??
      photo.src?.large ??
      null
    );
  } catch {
    return null;
  }
}

export default async function YogaPage() {
  const yogaImageUrl = await getYogaHeroImage();

  return (
    <main className="min-h-screen overflow-hidden bg-[#0d0c0a] text-white">
      <section
        className="relative isolate flex min-h-[560px] items-center bg-[#0d0c0a] bg-cover bg-center px-6 py-24 sm:min-h-[620px] sm:py-28 lg:min-h-[680px]"
        style={{
          backgroundImage: yogaImageUrl
            ? `url("${yogaImageUrl}")`
            : undefined,
        }}
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_15%,rgba(242,184,92,0.22),transparent_35%),radial-gradient(circle_at_15%_30%,rgba(182,240,0,0.08),transparent_30%),linear-gradient(145deg,rgba(23,19,15,0.82),rgba(13,12,10,0.78)_55%,rgba(8,9,9,0.88))]" />

        <FloatingBlob className="absolute -right-24 top-16 -z-10 h-72 w-72 rounded-full bg-amber-200/10 blur-3xl" />

        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Reveal immediate>
              <p className="text-xs font-bold uppercase tracking-[0.34em] text-amber-200/85">
                Morning Yoga at UniTurf
              </p>
            </Reveal>

            <TextReveal
              text="Start Your Day in Balance."
              delay={0.1}
              className="mt-5 max-w-3xl text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl"
            />

            <Reveal immediate delay={0.35}>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/60 sm:text-lg">
                A calm morning Yoga experience from 5:00 AM to 7:00 AM.
              </p>
            </Reveal>

            <Stagger immediate delay={0.5} className="mt-8 flex flex-wrap gap-3 text-sm text-white/75">
              <StaggerItem y={16}>
                <span className="inline-block rounded-full border border-amber-200/20 bg-amber-100/[0.06] px-4 py-2">
                  From ₹399 / person
                </span>
              </StaggerItem>

              <StaggerItem y={16}>
                <span className="inline-block rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                  Up to 30 participants
                </span>
              </StaggerItem>

              <StaggerItem y={16}>
                <span className="inline-block rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                  Morning sessions only
                </span>
              </StaggerItem>
            </Stagger>

            <Reveal immediate delay={0.7} className="inline-block">
            <a
              href="#yoga-booking"
              className="mt-9 inline-flex min-h-12 items-center justify-center rounded-full bg-amber-200 px-7 py-3 text-sm font-bold text-[#21170e] shadow-[0_10px_35px_rgba(242,184,92,0.18)] transition hover:-translate-y-0.5 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-[#0d0c0a]"
            >
              Book Your Session
            </a>
            </Reveal>
          </div>

          <Reveal immediate delay={0.3} y={40} className="relative min-h-[300px] overflow-hidden rounded-[2rem] border border-amber-100/15 bg-white/[0.04] p-8 shadow-[0_25px_100px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:min-h-[380px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,220,150,0.34),transparent_32%),linear-gradient(160deg,rgba(242,184,92,0.18),transparent_55%)]" />

            <div className="anim-glow absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-100/20 bg-amber-100/[0.06] shadow-[0_0_80px_rgba(242,184,92,0.2)]" />

            <div className="relative flex h-full min-h-[260px] items-end justify-between">
              <span className="text-xs uppercase tracking-[0.28em] text-amber-100/60">
                Breathe
              </span>

              <span className="text-xs uppercase tracking-[0.28em] text-white/45">
                Move · Reset
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-200/75">
            The morning practice
          </p>
        </Reveal>

        <TextReveal
          as="h2"
          text="A calmer way to begin."
          className="mt-3 text-3xl font-semibold tracking-tight"
        />

        <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "Flexibility & Mobility",
              "Make space for easier movement.",
            ],
            [
              "Morning Focus",
              "Create a clear pause before the day begins.",
            ],
            [
              "Mindful Movement",
              "Move with attention and steady breath.",
            ],
            [
              "Calm Start to the Day",
              "Carry a little more ease forward.",
            ],
          ].map(([title, copy]) => (
            <StaggerItem
              key={title}
              lift
              className="rounded-2xl border border-white/10 bg-[#15120f]/80 p-5 transition-colors hover:border-amber-200/30"
            >
              <h3 className="font-semibold text-white">
                {title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-white/60">
                {copy}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section
        id="yoga-booking"
        className="scroll-mt-24 px-6 py-20"
      >
        <Reveal y={48} className="mx-auto max-w-6xl rounded-[2rem] border border-amber-100/15 bg-white/[0.035] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.3)] backdrop-blur-sm sm:p-10">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-200/75">
              Reserve your place
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Book your Yoga morning.
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/55">
              Select your date, duration, and available time, then complete
              your secure payment to confirm.
            </p>
          </div>

          <YogaBookingWidget />
        </Reveal>
      </section>
    </main>
  );
}
