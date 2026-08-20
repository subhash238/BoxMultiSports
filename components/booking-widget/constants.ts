export const HOMEPAGE_BOOKING_SPORTS = [
  {
    slug: "badminton",
    label: "Badminton",
  },
  {
    slug: "cricket",
    label: "Cricket",
  },
  {
    slug: "football",
    label: "Football",
  },
  {
    slug: "net-practice",
    label: "Net Practice",
  },
  {
    slug: "pickleball",
    label: "Pickleball",
  },
] as const;

export type HomepageBookingSportSlug =
  (typeof HOMEPAGE_BOOKING_SPORTS)[number]["slug"];

export const SHARED_BOOKING_SPORT_SLUGS =
  HOMEPAGE_BOOKING_SPORTS.map(
    (sport) => sport.slug
  ) as readonly HomepageBookingSportSlug[];
