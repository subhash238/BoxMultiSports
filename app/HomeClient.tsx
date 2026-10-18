"use client";

import { useState } from "react";

import Hero from "../components/hero/Hero";
import BookingWidget from "../components/booking-widget/BookingWidget";
import MembershipPlans from "../components/memberships/MembershipPlans";

interface HomeClientProps {
  heroImageUrl?: string | null;
  sportHeroImages?: Record<string, string | null>;
}

export default function HomeClient({
  heroImageUrl,
  sportHeroImages = {},
}: HomeClientProps) {
  const [selectedSportSlug, setSelectedSportSlug] =
    useState<string | null>(null);

  const activeHeroImageUrl = selectedSportSlug
    ? sportHeroImages[selectedSportSlug] ?? heroImageUrl
    : heroImageUrl;

  return (
    <>
      <Hero
        selectedSportSlug={selectedSportSlug}
        onSportSelect={setSelectedSportSlug}
        heroImageUrl={activeHeroImageUrl}
      />

      <BookingWidget
        selectedSportSlug={selectedSportSlug}
      />

      <MembershipPlans />
    </>
  );
}