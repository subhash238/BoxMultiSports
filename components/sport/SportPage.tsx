"use client";

import SportHero from "./SportHero";
import SportGallery from "./SportGallery";
import SportFacilities from "./SportFacilities";
import SportBooking from "./SportBooking";
import SportPricing from "./SportPricing";
import SportFAQ from "./SportFAQ";

type SportPageProps = {
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  description: string;
};

export default function SportPage({
  title,
  subtitle,
  badge,
  image,
  description,
}: SportPageProps) {
  return (
    <>
      <SportHero
        title={title}
        subtitle={subtitle}
        badge={badge}
        image={image}
        description={description}
        bookingLink="#booking"
      />

      <SportGallery />

      <SportFacilities />

      <SportBooking />

      <SportPricing />

      <SportFAQ />
    </>
  );
}