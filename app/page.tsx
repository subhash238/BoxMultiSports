"use client";

import { useState } from "react";

import Hero from "../components/hero/Hero";
import BookingWidget from "../components/booking-widget/BookingWidget";

export default function Home() {
  const [selectedSportSlug, setSelectedSportSlug] =
    useState<string | null>(null);

  return (
    <>
      <Hero
        selectedSportSlug={selectedSportSlug}
        onSportSelect={setSelectedSportSlug}
      />
      <BookingWidget
        selectedSportSlug={selectedSportSlug}
      />
    </>
  );
}
