-- ==========================================
-- BOX MULTISPORTS - SPORT PRICING
-- ==========================================
-- Final pricing for Cricket / Football:
--
-- 1 Hour  = ₹999
-- 2 Hours = ₹1799
-- 3 Hours = ₹2699
-- 4 Hours = ₹3599
-- 5 Hours = ₹4499
-- 12 Hours = ₹9999
--
-- Players do NOT affect pricing.
-- ==========================================


-- ==========================================
-- CRICKET
-- ==========================================

INSERT INTO sport_pricing
  ("id", "sportId", "duration", "price", "isActive", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  s.id,
  p.duration,
  p.price,
  true,
  NOW(),
  NOW()
FROM sports s
CROSS JOIN (
  VALUES
    (1, 999),
    (2, 1799),
    (3, 2699),
    (4, 3599),
    (5, 4499),
    (12, 9999)
) AS p(duration, price)
WHERE s.slug = 'cricket'
ON CONFLICT ("sportId", "duration")
DO UPDATE SET
  "price" = EXCLUDED."price",
  "isActive" = true,
  "updatedAt" = NOW();


-- ==========================================
-- FOOTBALL
-- ==========================================

INSERT INTO sport_pricing
  ("id", "sportId", "duration", "price", "isActive", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  s.id,
  p.duration,
  p.price,
  true,
  NOW(),
  NOW()
FROM sports s
CROSS JOIN (
  VALUES
    (1, 999),
    (2, 1799),
    (3, 2699),
    (4, 3599),
    (5, 4499),
    (12, 9999)
) AS p(duration, price)
WHERE s.slug = 'football'
ON CONFLICT ("sportId", "duration")
DO UPDATE SET
  "price" = EXCLUDED."price",
  "isActive" = true,
  "updatedAt" = NOW();


-- ==========================================
-- VOLLEYBALL
-- ==========================================
--
-- IMPORTANT:
-- The existing database slug is:
-- "vollyball"
--
-- Volleyball will be made INACTIVE
-- for V1 and will not be available
-- for customer booking.
-- ==========================================

INSERT INTO sport_pricing
  ("id", "sportId", "duration", "price", "isActive", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  s.id,
  p.duration,
  p.price,
  false,
  NOW(),
  NOW()
FROM sports s
CROSS JOIN (
  VALUES
    (1, 1000),
    (2, 1800),
    (3, 2700),
    (4, 3500),
    (5, 4500),
    (12, 9000)
) AS p(duration, price)
WHERE s.slug = 'vollyball'
ON CONFLICT ("sportId", "duration")
DO UPDATE SET
  "price" = EXCLUDED."price",
  "isActive" = false,
  "updatedAt" = NOW();