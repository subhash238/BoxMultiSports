BEGIN;

DO $$
DECLARE
  gym_rows INTEGER;
  gym_pricing_rows INTEGER;
BEGIN
  SELECT count(*)
  INTO gym_rows
  FROM "sports"
  WHERE "slug" = 'gym'
    AND "isActive" = true
    AND "maxPlayers" = 25
    AND "pricePerHour" = 399;

  IF gym_rows <> 1 THEN
    RAISE EXCEPTION
      'Expected exactly one active Gym sport with maxPlayers 25 and pricePerHour 399, found %',
      gym_rows;
  END IF;

  SELECT count(*)
  INTO gym_pricing_rows
  FROM "sport_pricing" AS pricing
  JOIN "sports" AS sport
    ON sport."id" = pricing."sportId"
  WHERE sport."slug" = 'gym';

  IF gym_pricing_rows <> 0 THEN
    RAISE EXCEPTION
      'Expected zero existing Gym SportPricing rows, found %',
      gym_pricing_rows;
  END IF;
END $$;

DO $$
DECLARE
  inserted_rows INTEGER;
BEGIN
  WITH gym_prices("duration", "price") AS (
    VALUES
      (60, 399),
      (90, 599),
      (120, 799)
  )
  INSERT INTO "sport_pricing" (
    "id",
    "sportId",
    "duration",
    "price",
    "isActive",
    "createdAt",
    "updatedAt"
  )
  SELECT
    gen_random_uuid()::text,
    sport."id",
    gym_prices."duration",
    gym_prices."price",
    true,
    NOW(),
    NOW()
  FROM gym_prices
  JOIN "sports" AS sport
    ON sport."slug" = 'gym';

  GET DIAGNOSTICS inserted_rows = ROW_COUNT;

  IF inserted_rows <> 3 THEN
    RAISE EXCEPTION
      'Expected three Gym SportPricing inserts, inserted %',
      inserted_rows;
  END IF;
END $$;

DO $$
DECLARE
  final_rows INTEGER;
  matching_rows INTEGER;
  distinct_durations INTEGER;
BEGIN
  SELECT count(*), count(DISTINCT pricing."duration")
  INTO final_rows, distinct_durations
  FROM "sport_pricing" AS pricing
  JOIN "sports" AS sport
    ON sport."id" = pricing."sportId"
  WHERE sport."slug" = 'gym';

  WITH expected("duration", "price") AS (
    VALUES
      (60, 399),
      (90, 599),
      (120, 799)
  )
  SELECT count(*)
  INTO matching_rows
  FROM expected
  JOIN "sports" AS sport
    ON sport."slug" = 'gym'
  JOIN "sport_pricing" AS pricing
    ON pricing."sportId" = sport."id"
    AND pricing."duration" = expected."duration"
    AND pricing."price" = expected."price"
    AND pricing."isActive" = true;

  IF final_rows <> 3
    OR matching_rows <> 3
    OR distinct_durations <> 3 THEN
    RAISE EXCEPTION
      'Final Gym SportPricing state is invalid: total %, matching %, distinct durations %',
      final_rows,
      matching_rows,
      distinct_durations;
  END IF;
END $$;

COMMIT;
