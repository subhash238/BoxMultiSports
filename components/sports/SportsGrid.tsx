"use client";

import {
  type KeyboardEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";

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
          (result.sports ?? []).filter(
            (sport) =>
              SPORTS_PAGE_SLUGS.includes(
                sport.slug
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
    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sports.map((sport) => {
        const isExpanded =
          expandedSportSlug === sport.slug;

        const startingPrice =
          sport.pricing[0]?.price ??
          sport.pricePerHour;

        const displayPrice =
          formatPrice(startingPrice);

        return (
          <article
            key={sport.id}
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
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
          >
            <h2 className="text-2xl font-bold">
              {SPORT_DISPLAY_NAMES[sport.slug] ??
                sport.name}
            </h2>

            {sport.description && (
              <p className="mt-3 text-sm leading-6 text-white/60">
                {sport.description}
              </p>
            )}

            <p className="mt-5 text-[#B6F000]">
              Starting {displayPrice} / hour
            </p>

            <p className="mt-2 text-sm text-white/60">
              Up to {sport.maxPlayers} players
            </p>

            <span className="mt-6 inline-block text-sm font-semibold text-white/80">
              {isExpanded
                ? "Hide Pricing"
                : "View Pricing"}
            </span>

            {isExpanded && (
              <div
                className="mt-5 border-t border-white/10 pt-5"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                {sport.pricing.length > 0 ? (
                  <div className="space-y-3">
                    {sport.pricing.map(
                      (pricing) => (
                        <div
                          key={pricing.duration}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-white/70">
                            {pricing.duration ===
                            1
                              ? "1 Hour"
                              : `${pricing.duration} Hours`}
                          </span>

                          <span className="font-semibold text-[#B6F000]">
                            {formatPrice(
                              pricing.price
                            )}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-white/60">
                    Pricing currently unavailable.
                  </p>
                )}

                <Link
                  href={`/?sport=${sport.slug}#booking`}
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                  className="mt-6 inline-block rounded-xl bg-[#B6F000] px-5 py-3 text-sm font-bold text-black"
                >
                  Book Now
                </Link>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
