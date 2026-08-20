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

export type BookingDurationOption = {
  label: string;
  minutes: number;
};

export const MAIN_BOOKING_DURATION_CATALOG = [
  { label: "1 Hour", minutes: 60 },
  { label: "1.5 Hours", minutes: 90 },
  { label: "2 Hours", minutes: 120 },
  { label: "2.5 Hours", minutes: 150 },
  { label: "3 Hours", minutes: 180 },
  { label: "3.5 Hours", minutes: 210 },
  { label: "4 Hours", minutes: 240 },
  { label: "4.5 Hours", minutes: 270 },
  { label: "5 Hours", minutes: 300 },
  { label: "5.5 Hours", minutes: 330 },
  { label: "6 Hours", minutes: 360 },
  { label: "12 Hours", minutes: 720 },
] as const satisfies readonly BookingDurationOption[];

export const ENABLED_MAIN_BOOKING_DURATION_MINUTES = [
  60,
  90,
  120,
  150,
  180,
  210,
  240,
  270,
  300,
  330,
  720,
] as const;

const enabledMainBookingDurationMinutes =
  new Set<number>(
    ENABLED_MAIN_BOOKING_DURATION_MINUTES
  );

export const ENABLED_MAIN_BOOKING_DURATIONS =
  MAIN_BOOKING_DURATION_CATALOG.filter(
    (duration) =>
      enabledMainBookingDurationMinutes.has(
        duration.minutes
      )
  );
