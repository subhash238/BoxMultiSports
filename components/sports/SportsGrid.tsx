"use client";

import {
  type KeyboardEvent,
  useEffect,
  useState,
} from "react";
import BookNowTrigger from "@/components/booking-widget/BookNowTrigger";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

const SPORTS_PAGE_SLUGS = [
  "cricket",
  "football",
  "pickleball",
  "badminton",
  "net-practice",
];

const SPORT_DISPLAY_NAMES: Record<
  string,
  string
> = {
  cricket: "Box Cricket",
};

const SPORT_FALLBACK_BACKGROUNDS: Record<
  string,
  string
> = {
  cricket:
    "bg-gradient-to-br from-[#263d16] via-[#101a0d] to-[#050705]",
  football:
    "bg-gradient-to-br from-[#172a3d] via-[#0b121b] to-[#050705]",
  pickleball:
    "bg-gradient-to-br from-[#3d3516] via-[#181509] to-[#050705]",
  badminton:
    "bg-gradient-to-br from-[#321a3d] via-[#160b1b] to-[#050705]",
  "net-practice":
    "bg-gradient-to-br from-[#173d37] via-[#0b1b18] to-[#050705]",
};

type SportPricing = {
  duration: number;
  price: number | string;
};

type Sport = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  pricePerHour: number | string;
  maxPlayers: number;
  imageUrl?: string | null;
  pricing: SportPricing[];
};

type SportsResponse = {
  success?: boolean;
  message?: string;
  sports?: Sport[];
};

function formatPrice(
  price: number | string
): string {
  const numericPrice = Number(price);

  return Number.isFinite(numericPrice)
    ? `₹${numericPrice.toLocaleString("en-IN")}`
    : "Price unavailable";
}

export default function SportsGrid() {
  const [sports, setSports] =
    useState<Sport[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [expandedSportSlug, setExpandedSportSlug] =
    useState<string | null>(null);

  const prefersReducedMotion =
    useReducedMotion();

  useEffect(() => {
    async function fetchSports() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "/api/sports",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result =
          (await response.json()) as SportsResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ??
              "Unable to load sports."
          );
        }

        setSports(
          (result.sports ?? [])
            .filter((sport) =>
              SPORTS_PAGE_SLUGS.includes(
                sport.slug
              )
            )
            .sort(
              (first, second) =>
                SPORTS_PAGE_SLUGS.indexOf(
                  first.slug
                ) -
                SPORTS_PAGE_SLUGS.indexOf(
                  second.slug
                )
            )
        );
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load sports."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchSports();
  }, []);

  if (loading) {
    return (
      <p className="mt-10 text-white/60">
        Loading sports...
      </p>
    );
  }

  if (error) {
    return (
      <p className="mt-10 text-red-400">
        {error}
      </p>
    );
  }

  const toggleSport = (slug: string) => {
    setExpandedSportSlug((currentSlug) =>
      currentSlug === slug ? null : slug
    );
  };

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    slug: string
  ) => {
    if (
      event.target !== event.currentTarget
    ) {
      return;
    }

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      toggleSport(slug);
    }
  };

  return (
    <div className="mt-10 grid gap-6 md:grid-cols-2">
      {sports.map((sport) => {
        const isExpanded =
          expandedSportSlug === sport.slug;

        const startingPrice =
          sport.pricing[0]?.price ??
          sport.pricePerHour;

        const displayPrice =
          formatPrice(startingPrice);

        const backgroundImage =
          sport.imageUrl
            ? `url(${sport.imageUrl})`
            : undefined;

        return (
          <motion.article
            key={sport.id}
            layout
            initial="rest"
            animate="rest"
            whileHover={
              prefersReducedMotion
                ? undefined
                : "hover"
            }
            role="button"
            tabIndex={0}
            onClick={() =>
              toggleSport(sport.slug)
            }
            onKeyDown={(event) =>
              handleCardKeyDown(
                event,
                sport.slug
              )
            }
            variants={{
              rest: {
                y: 0,
                borderColor:
                  "rgba(255,255,255,0.10)",
                boxShadow:
                  "0 10px 30px rgba(0,0,0,0.16)",
              },
              hover: {
                y: -5,
                borderColor:
                  "rgba(182,240,0,0.42)",
                boxShadow:
                  "0 18px 42px rgba(0,0,0,0.30), 0 0 24px rgba(182,240,0,0.10)",
              },
            }}
            transition={{
              layout: {
                duration: prefersReducedMotion
                  ? 0
                  : 0.3,
              },
              duration: prefersReducedMotion
                ? 0
                : 0.25,
            }}
            className={`group relative isolate overflow-hidden rounded-2xl border bg-[#090d09] ${
              sport.slug === "net-practice"
                ? "md:col-span-2"
                : ""
            } ${
              SPORT_FALLBACK_BACKGROUNDS[
                sport.slug
              ] ??
              "bg-gradient-to-br from-[#182018] to-[#050705]"
            }`}
          >
            <motion.div
              variants={{
                rest: { scale: 1 },
                hover: { scale: 1.04 },
              }}
              transition={{
                duration: prefersReducedMotion
                  ? 0
                  : 0.55,
              }}
              className="absolute inset-0 -z-20 bg-cover bg-center"
              style={{
                backgroundImage,
              }}
            />

            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/20 via-[#050705]/75 to-[#050705]" />

            <div
              className={`relative p-7 ${
                sport.slug === "net-practice"
                  ? "mx-auto w-full max-w-4xl"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <motion.h2
                  variants={{
                    rest: { y: 0 },
                    hover: { y: -3 },
                  }}
                  className="text-2xl font-bold tracking-tight"
                >
                  {SPORT_DISPLAY_NAMES[
                    sport.slug
                  ] ?? sport.name}
                </motion.h2>

                <motion.span
                  animate={{
                    rotate: isExpanded ? 180 : 0,
                  }}
                  transition={{
                    duration: prefersReducedMotion
                      ? 0
                      : 0.25,
                  }}
                  aria-hidden="true"
                  whileHover={
                    prefersReducedMotion
                      ? undefined
                      : { scale: 1.06, y: -1 }
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/25 text-xl text-[#B6F000] backdrop-blur-sm transition-colors group-hover:border-[#B6F000]/40"
                >
                  ⌄
                </motion.span>
              </div>

              {sport.description && (
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">
                  {sport.description}
                </p>
              )}

              <p className="mt-6 text-lg font-semibold text-[#B6F000]">
                Starting {displayPrice} / hour
              </p>

              <p className="mt-2 text-sm text-white/60">
                Up to {sport.maxPlayers} players
              </p>

              <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold tracking-wide text-[#B6F000]/90 transition-colors group-hover:text-[#B6F000]">
                {isExpanded
                  ? "Hide Pricing"
                  : "View Pricing"}
                <span aria-hidden="true" className="text-base">
                  →
                </span>
              </span>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    key="pricing"
                    layout
                    initial={
                      prefersReducedMotion
                        ? false
                        : { opacity: 0, height: 0 }
                    }
                    animate={{
                      opacity: 1,
                      height: "auto",
                    }}
                    exit={
                      prefersReducedMotion
                        ? undefined
                        : { opacity: 0, height: 0 }
                    }
                    transition={{
                      duration: prefersReducedMotion
                        ? 0
                        : 0.3,
                    }}
                    className="mt-6 overflow-hidden border-t border-white/15 pt-6"
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  >
                    {sport.pricing.length > 0 ? (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: {},
                          visible: {
                            transition: {
                              staggerChildren:
                                prefersReducedMotion
                                  ? 0
                                  : 0.04,
                            },
                          },
                        }}
                        className="space-y-1"
                      >
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                          Pricing
                        </p>
                        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                          <span>Duration</span>
                          <span>Price</span>
                        </div>
                        {sport.pricing.map(
                          (pricing) => (
                            <motion.div
                              key={pricing.duration}
                              variants={{
                                hidden: {
                                  opacity: 0,
                                  y: prefersReducedMotion
                                    ? 0
                                    : 5,
                                },
                                visible: {
                                  opacity: 1,
                                  y: 0,
                                },
                              }}
                              className="flex items-center justify-between border-b border-white/10 py-2.5 text-sm last:border-b-0"
                            >
                              <span className="text-white/70">
                                {pricing.duration >=
                                720
                                  ? "Full Day"
                                  : pricing.duration %
                                        60 ===
                                      0
                                    ? `${pricing.duration / 60} Hour${pricing.duration === 60 ? "" : "s"}`
                                    : `${Math.floor(pricing.duration / 60)}h ${pricing.duration % 60}m`}
                              </span>

                              <span className="font-semibold text-[#B6F000]">
                                {formatPrice(
                                  pricing.price
                                )}
                              </span>
                            </motion.div>
                          )
                        )}
                      </motion.div>
                    ) : (
                      <p className="text-sm text-white/60">
                        Pricing currently unavailable.
                      </p>
                    )}

                    <motion.div
                      whileHover={
                        prefersReducedMotion
                          ? undefined
                          : {
                              x: 2,
                              scale: 1.02,
                            }
                      }
                      whileTap={
                        prefersReducedMotion
                          ? undefined
                          : { scale: 0.98 }
                      }
                      transition={{
                        duration: prefersReducedMotion
                          ? 0
                          : 0.2,
                      }}
                      className="mt-6 inline-block"
                    >
                      <BookNowTrigger
                        sportSlug={sport.slug}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#B6F000] px-5 py-3 text-sm font-bold text-black shadow-[0_0_18px_rgba(182,240,0,0.16)]"
                      >
                        Book Now
                        <span aria-hidden="true">→</span>
                      </BookNowTrigger>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
