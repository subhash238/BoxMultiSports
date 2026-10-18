-- BoxMultiSports current production pricing.
-- Durations are stored in MINUTES.
-- Safe to re-run: (sportId, duration) is the conflict key.

WITH pricing_values("slug", "duration", "price") AS (
  VALUES
    -- Cricket
    ('cricket', 60, 800),
    ('cricket', 120, 1500),

    -- Football
    ('football', 60, 800),
    ('football', 120, 1500),

    -- Pickleball
    ('pickleball', 60, 999),
    ('pickleball', 90, 1499),
    ('pickleball', 120, 1799),
    ('pickleball', 150, 2299),
    ('pickleball', 180, 2699),
    ('pickleball', 210, 3199),
    ('pickleball', 240, 3599),
    ('pickleball', 270, 4099),
    ('pickleball', 300, 4599),
    ('pickleball', 330, 5099),
    ('pickleball', 720, 9999),

    -- Badminton
    ('badminton', 60, 999),
    ('badminton', 90, 1499),
    ('badminton', 120, 1799),
    ('badminton', 150, 2299),
    ('badminton', 180, 2699),
    ('badminton', 210, 3199),
    ('badminton', 240, 3599),
    ('badminton', 270, 4099),
    ('badminton', 300, 4599),
    ('badminton', 330, 5099),
    ('badminton', 720, 9999),

    -- Net Practice
    ('net-practice', 60, 299),
    ('net-practice', 90, 449),
    ('net-practice', 120, 599),
    ('net-practice', 150, 749),
    ('net-practice', 180, 899),
    ('net-practice', 210, 1049),
    ('net-practice', 240, 1199),
    ('net-practice', 270, 1349),
    ('net-practice', 300, 1499),
    ('net-practice', 330, 1649),
    ('net-practice', 720, 3599),

    -- Yoga (per person)
    ('yoga', 60, 399),
    ('yoga', 90, 599),
    ('yoga', 120, 799),

    -- Gym (per person)
    ('gym', 60, 399),
    ('gym', 90, 599),
    ('gym', 120, 799)
)
INSERT INTO sport_pricing
  ("id", "sportId", "duration", "price", "isActive", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  s.id,
  p."duration",
  p."price",
  true,
  NOW(),
  NOW()
FROM pricing_values p
JOIN sports s ON s.slug = p."slug"
ON CONFLICT ("sportId", "duration") DO UPDATE SET
  "price" = EXCLUDED."price",
  "isActive" = true,
  "updatedAt" = NOW();

-- Deactivate removed cricket/football durations
-- (only 60min and 120min are bookable now).
UPDATE sport_pricing sp
SET "isActive" = false, "updatedAt" = NOW()
FROM sports s
WHERE sp."sportId" = s.id
  AND s.slug IN ('cricket', 'football')
  AND sp."duration" NOT IN (60, 120);
