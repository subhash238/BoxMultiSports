"use client";

import { Images, Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export type GalleryItem = {
  id: string;
  caption: string | null;
  mediaType: string;
  mediaProductType: string;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  permalink: string | null;
  timestamp: string | null;
};

export function formatGalleryDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function InstagramCard({
  item,
  onOpen,
}: {
  item: GalleryItem;
  onOpen: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const isVideo = item.mediaType === "VIDEO";
  const isAlbum = item.mediaType === "CAROUSEL_ALBUM";
  const date = formatGalleryDate(item.timestamp);

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={prefersReducedMotion ? undefined : { y: -4 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      aria-label={item.caption || (isVideo ? "Play reel" : "Open photo")}
      className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#121212] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B6F000]"
    >
      {item.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- external Instagram CDN media
        <img
          src={item.thumbnailUrl}
          alt={item.caption || "UniTurf on Instagram"}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(182,240,0,0.25),transparent_35%),linear-gradient(145deg,#1a2a10,#0a0f0a_70%)]" />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 transition group-hover:opacity-100" />

      {(isVideo || isAlbum) && (
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
          {isVideo ? (
            <Play size={14} fill="currentColor" aria-hidden="true" />
          ) : (
            <Images size={14} aria-hidden="true" />
          )}
        </span>
      )}

      {isVideo && (
        <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white opacity-0 backdrop-blur-sm transition duration-300 group-hover:opacity-100 group-hover:scale-110">
          <Play size={22} fill="currentColor" aria-hidden="true" />
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4">
        {item.caption && (
          <p className="line-clamp-2 text-sm leading-5 text-white/90">
            {item.caption}
          </p>
        )}
        {date && (
          <p className="mt-1.5 text-[11px] uppercase tracking-[0.18em] text-white/50">
            {date}
          </p>
        )}
      </div>
    </motion.button>
  );
}
