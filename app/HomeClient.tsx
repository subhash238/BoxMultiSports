"use client";

import { useState } from "react";

import Hero from "../components/hero/Hero";
import BookingWidget from "../components/booking-widget/BookingWidget";

interface HomeClientProps {
  heroImageUrl?: string | null;
}

export default function HomeClient({
  heroImageUrl,
}: HomeClientProps) {
  const [selectedSportSlug, setSelectedSportSlug] =
    useState<string | null>(null);

  return (
    <>
      <Hero
        selectedSportSlug={selectedSportSlug}
        onSportSelect={setSelectedSportSlug}
        heroImageUrl={heroImageUrl}
      />

      <BookingWidget
        selectedSportSlug={selectedSportSlug}
      />
    </>
  );
}