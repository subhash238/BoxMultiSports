BEGIN;

DO $$
DECLARE
  yoga_rows INTEGER;
  yoga_pricing_rows INTEGER;
BEGIN
  SELECT count(*)
  INTO yoga_rows
  FROM "sports"
  WHERE "slug" = 'yoga'
    AND "isActive" = true
    AND "maxPlayers" = 30
    AND "pricePerHour" = 399;

  IF yoga_rows <> 1 THEN
    RAISE EXCEPTION
      'Expected exactly one active Yoga sport with maxPlayers 30 and pricePerHour 399, found %',
      yoga_rows;
  END IF;

  SELECT count(*)
  INTO yoga_pricing_rows
  FROM "sport_pricing" AS pricing
  JOIN "sports" AS sport
    ON sport."id" = pricing."sportId"
  WHERE sport."slug" = 'yoga';

  IF yoga_pricing_rows <> 0 THEN
    RAISE EXCEPTION
      'Expected zero existing Yoga SportPricing rows, found %',
      yoga_pricing_rows;
  END IF;
END $$;

DO $$
DECLARE
  inserted_rows INTEGER;
BEGIN
  WITH yoga_prices("duration", "price") AS (
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
    yoga_prices."duration",
    yoga_prices."price",
    true,
    NOW(),
    NOW()
  FROM yoga_prices
  JOIN "sports" AS sport
    ON sport."slug" = 'yoga';

  GET DIAGNOSTICS inserted_rows = ROW_COUNT;

  IF inserted_rows <> 3 THEN
    RAISE EXCEPTION
      'Expected three Yoga SportPricing inserts, inserted %',
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
  WHERE sport."slug" = 'yoga';

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
    ON sport."slug" = 'yoga'
  JOIN "sport_pricing" AS pricing
    ON pricing."sportId" = sport."id"
    AND pricing."duration" = expected."duration"
    AND pricing."price" = expected."price"
    AND pricing."isActive" = true;

  IF final_rows <> 3
    OR matching_rows <> 3
    OR distinct_durations <> 3 THEN
    RAISE EXCEPTION
      'Final Yoga SportPricing state is invalid: total %, matching %, distinct durations %',
      final_rows,
      matching_rows,
      distinct_durations;
  END IF;
END $$;

COMMIT;
