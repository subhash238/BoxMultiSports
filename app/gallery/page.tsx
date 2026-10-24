"use client";

import { useEffect, useState } from "react";

import InstagramCard from "@/components/gallery/InstagramCard";
import { Reveal, Stagger, StaggerItem, TextReveal } from "@/components/motion/Motion";

const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/uni_.turf/";

type GalleryReel = {
  id: string;
  caption: string | null;
  mediaType: string;
  mediaProductType: string;
  thumbnailUrl: string | null;
  permalink: string | null;
  timestamp: string | null;
};

type GalleryResponse = {
  success?: boolean;
  reels?: GalleryReel[];
  nextCursor?: string | null;
};

function canonicalPermalink(permalink: string): string {
  return permalink.replace(/\/$/, "");
}

function appendUniqueReels(
  existing: GalleryReel[],
  incoming: GalleryReel[]
): GalleryReel[] {
  const seenIds = new Set(existing.map((reel) => reel.id));
  const seenPermalinks = new Set(
    existing
      .map((reel) => reel.permalink)
      .filter((permalink): permalink is string => Boolean(permalink))
      .map(canonicalPermalink)
  );
  const additions: GalleryReel[] = [];

  for (const reel of incoming) {
    const permalink = reel.permalink
      ? canonicalPermalink(reel.permalink)
      : null;

    if (
      seenIds.has(reel.id) ||
      (permalink !== null && seenPermalinks.has(permalink))
    ) {
      continue;
    }

    seenIds.add(reel.id);
    if (permalink !== null) {
      seenPermalinks.add(permalink);
    }
    additions.push(reel);
  }

  return [...existing, ...additions];
}

function GallerySkeleton() {
  return (
    <div className="aspect-[9/16] animate-pulse rounded-[1.75rem] border border-white/10 bg-white/[0.06]" />
  );
}

export default function GalleryPage() {
  const [reels, setReels] = useState<GalleryReel[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReels() {
      try {
        const response = await fetch(
          "/api/instagram/media?limit=6",
          { signal: controller.signal }
        );
        const payload =
          (await response.json()) as GalleryResponse;

        if (!response.ok || !payload.success) {
          throw new Error("Gallery request failed");
        }

        setReels(payload.reels ?? []);
        setNextCursor(payload.nextCursor ?? null);
      } catch {
        if (!controller.signal.aborted) {
          setHasError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadReels();

    return () => controller.abort();
  }, []);

  async function loadMoreReels() {
    if (!nextCursor || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setLoadMoreError(false);

    try {
      const params = new URLSearchParams({
        limit: "6",
        after: nextCursor,
      });
      const response = await fetch(
        `/api/instagram/media?${params.toString()}`
      );
      const payload =
        (await response.json()) as GalleryResponse;

      if (!response.ok || !payload.success) {
        throw new Error("Load more request failed");
      }

      setReels((current) =>
        appendUniqueReels(current, payload.reels ?? [])
      );
      setNextCursor(payload.nextCursor ?? null);
    } catch {
      setLoadMoreError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0d0c0a] px-6 pb-24 pt-32 text-white sm:pt-40">
      <section className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Reveal immediate>
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-amber-200/80">
              From @uni_.turf
            </p>
          </Reveal>
          <TextReveal
            text="The UniTurf gallery."
            delay={0.1}
            className="mt-5 text-5xl font-semibold tracking-[-0.06em] sm:text-6xl"
          />
          <Reveal immediate delay={0.35}>
            <p className="mt-5 text-base leading-7 text-white/60 sm:text-lg">
              Feel the energy, the competition, and the moments that happen on
              our courts.
            </p>
          </Reveal>
        </div>

        {isLoading ? (
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <GallerySkeleton key={index} />
            ))}
          </div>
        ) : hasError ? (
          <GalleryFallback />
        ) : reels.length === 0 ? (
          <GalleryFallback empty />
        ) : (
          <Stagger className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reels.map((reel) => (
              <StaggerItem key={reel.id} y={40}>
                <InstagramCard
                  {...reel}
                  permalink={reel.permalink ?? INSTAGRAM_PROFILE_URL}
                  thumbnailUrl={reel.thumbnailUrl ?? null}
                  mediaType={reel.mediaType}
                />
              </StaggerItem>
            ))}
          </Stagger>
        )}

        {!isLoading && !hasError && reels.length > 0 && nextCursor ? (
          <div className="mt-10 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => void loadMoreReels()}
              disabled={isLoadingMore}
              aria-busy={isLoadingMore}
              className="rounded-full border border-amber-200/35 bg-amber-200/[0.06] px-6 py-3 text-sm font-semibold text-amber-100 transition hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-200/10 motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isLoadingMore ? "Loading more..." : "Load More"}
            </button>
            <p
              aria-live="polite"
              className="min-h-5 text-sm text-white/50"
            >
              {loadMoreError
                ? "Unable to load more moments right now."
                : isLoadingMore
                  ? "Loading more moments..."
                  : ""}
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function GalleryFallback({ empty = false }: { empty?: boolean }) {
  return (
    <div className="mt-12 rounded-[1.75rem] border border-white/10 bg-white/[0.04] px-6 py-12 text-center">
      <p className="text-lg font-medium text-white/85">
        {empty
          ? "More UniTurf moments coming soon."
          : "Unable to load Instagram moments right now."}
      </p>
      <a
        href={INSTAGRAM_PROFILE_URL}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-5 inline-flex rounded-full border border-amber-200/35 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:border-amber-200 hover:bg-amber-200/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
      >
        View @uni_.turf on Instagram
      </a>
    </div>
  );
}
