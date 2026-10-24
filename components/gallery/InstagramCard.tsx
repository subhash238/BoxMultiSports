"use client";

import { Camera, Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

type InstagramCardProps = {
  id: string;
  caption?: string | null;
  thumbnailUrl: string | null;
  permalink: string;
  timestamp?: string | null;
  mediaType?: string | null;
};

export default function InstagramCard({
  id,
  caption,
  thumbnailUrl,
  permalink,
  timestamp,
  mediaType,
}: InstagramCardProps) {
  const isVideo = mediaType === "VIDEO";
  const kindLabel = isVideo
    ? "Instagram Reel"
    : mediaType === "CAROUSEL_ALBUM"
      ? "Instagram Album"
      : "Instagram Post";
  const prefersReducedMotion = useReducedMotion();
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlaybackError, setHasPlaybackError] =
    useState(false);

  const embedUrl = permalink.endsWith("/")
    ? `${permalink}embed/`
    : `${permalink}/embed/`;
  const showPlayback = isPlaying && !hasPlaybackError;

  return (
    <motion.article
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={prefersReducedMotion ? undefined : { y: -6 }}
      className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] shadow-[0_22px_70px_rgba(0,0,0,0.28)] transition-colors hover:border-amber-200/35"
    >
      <div className="relative aspect-[9/16] overflow-hidden bg-[#17130f]">
        {showPlayback ? (
          <iframe
            src={embedUrl}
            title={caption || "UniTurf Instagram Reel"}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            onError={() => setHasPlaybackError(true)}
            className="h-full w-full border-0"
          />
        ) : (
          <>
            {thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- external Instagram CDN media
              <img
                src={thumbnailUrl}
                alt={caption || "UniTurf Instagram Reel"}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            ) : (
              <div
                role="img"
                aria-label="UniTurf Instagram Reel preview"
                className="h-full w-full bg-[radial-gradient(circle_at_25%_20%,rgba(242,184,92,0.55),transparent_30%),linear-gradient(145deg,#6a3a2a,#17130f_70%)]"
              />
            )}
          </>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/25" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md">
          <Camera size={13} aria-hidden="true" />
          <span>@uni_.turf</span>
        </div>
        {!showPlayback && !hasPlaybackError ? (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label={isVideo ? "Play Reel preview" : "Open post preview"}
            className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/55 bg-black/35 text-white shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur-sm transition duration-300 hover:scale-110 hover:bg-amber-200 hover:text-[#21170e] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            {isVideo ? (
              <Play size={21} fill="currentColor" aria-hidden="true" />
            ) : (
              <Camera size={21} aria-hidden="true" />
            )}
          </button>
        ) : null}
        {hasPlaybackError ? (
          <div className="absolute inset-x-5 top-1/2 -translate-y-1/2 rounded-2xl border border-white/15 bg-black/55 p-4 text-center backdrop-blur-md">
            <p className="text-sm font-medium text-white/90">
              Unable to preview this post here.
            </p>
            <a
              href={permalink}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.15em] text-amber-200 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              View on Instagram
            </a>
          </div>
        ) : null}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/85">
            {kindLabel}
          </p>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/90">
            {caption || "Discover the UniTurf experience."}
          </p>
          {timestamp ? (
            <time
              dateTime={timestamp}
              className="mt-3 block text-[0.7rem] uppercase tracking-[0.18em] text-white/50"
            >
              {timestamp}
            </time>
          ) : null}
          {!hasPlaybackError ? (
            <a
              href={permalink}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-flex text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-amber-200/85 underline-offset-4 hover:text-amber-100 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              View on Instagram
            </a>
          ) : null}
        </div>
      </div>
      <span className="sr-only">Reel ID: {id}</span>
    </motion.article>
  );
}
