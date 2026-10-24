"use client";

import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { formatGalleryDate, GalleryItem } from "./InstagramCard";

const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/uni_.turf/";

export default function GalleryLightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const item = index !== null ? items[index] : null;
  const hasPrev = index !== null && index > 0;
  const hasNext = index !== null && index < items.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev && index !== null) onNavigate(index - 1);
  }, [hasPrev, index, onNavigate]);
  const goNext = useCallback(() => {
    if (hasNext && index !== null) onNavigate(index + 1);
  }, [hasNext, index, onNavigate]);

  useEffect(() => {
    if (!item) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [item, onClose, goPrev, goNext]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm sm:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={20} />
          </button>

          {hasPrev && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Previous"
              className="absolute left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:flex lg:left-6"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          {hasNext && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Next"
              className="absolute right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:flex lg:right-6"
            >
              <ChevronRight size={22} />
            </button>
          )}

          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d0b] lg:flex-row"
          >
            <div className="flex min-h-0 flex-1 items-center justify-center bg-black">
              {item.mediaType === "VIDEO" && item.mediaUrl ? (
                <video
                  key={item.mediaUrl}
                  src={item.mediaUrl}
                  poster={item.thumbnailUrl ?? undefined}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[70vh] w-full object-contain lg:max-h-[85vh]"
                />
              ) : item.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- external Instagram CDN media
                <img
                  src={item.mediaUrl ?? item.thumbnailUrl}
                  alt={item.caption || "UniTurf on Instagram"}
                  className="max-h-[70vh] w-full object-contain lg:max-h-[85vh]"
                />
              ) : null}
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 border-t border-white/10 p-4 text-white lg:w-80 lg:border-l lg:border-t-0 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B6F000] text-xs font-extrabold text-black">
                  UT
                </div>
                <div>
                  <p className="text-sm font-bold">@uni_.turf</p>
                  {formatGalleryDate(item.timestamp) && (
                    <p className="text-xs text-white/45">
                      {formatGalleryDate(item.timestamp)}
                    </p>
                  )}
                </div>
              </div>
              {item.caption && (
                <p className="max-h-40 overflow-y-auto whitespace-pre-line text-sm leading-6 text-white/80 lg:max-h-none">
                  {item.caption}
                </p>
              )}
              <a
                href={item.permalink ?? INSTAGRAM_PROFILE_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-auto inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#B6F000] hover:underline"
              >
                View on Instagram <ExternalLink size={13} />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
