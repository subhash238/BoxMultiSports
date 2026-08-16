-- ==========================================
-- BOX MULTISPORTS - SPORT PRICING
-- ==========================================
-- Final pricing:
--
-- 1 Hour   = ₹1000
-- 2 Hours  = ₹1800
-- 3 Hours  = ₹2700
-- 4 Hours  = ₹3500
-- 5 Hours  = ₹4500
-- 12 Hours = ₹9000
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
    (1, 1000.00),
    (2, 1800.00),
    (3, 2700.00),
    (4, 3500.00),
    (5, 4500.00),
    (12, 9000.00)
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
    (1, 1000.00),
    (2, 1800.00),
    (3, 2700.00),
    (4, 3500.00),
    (5, 4500.00),
    (12, 9000.00)
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
    (1, 1000.00),
    (2, 1800.00),
    (3, 2700.00),
    (4, 3500.00),
    (5, 4500.00),
    (12, 9000.00)
) AS p(duration, price)
WHERE s.slug = 'vollyball'
ON CONFLICT ("sportId", "duration")
DO UPDATE SET
  "price" = EXCLUDED."price",
  "isActive" = true,
  "updatedAt" = NOW();