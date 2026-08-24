BEGIN;

DO $$
DECLARE
  matched_sports INTEGER;
  current_rows INTEGER;
BEGIN
  SELECT count(*)
  INTO matched_sports
  FROM "sports"
  WHERE "slug" IN (
    'badminton',
    'cricket',
    'football',
    'net-practice',
    'pickleball'
  )
    AND "isActive" = true;

  IF matched_sports <> 5 THEN
    RAISE EXCEPTION
      'Expected exactly five active approved Main Sports, found %',
      matched_sports;
  END IF;

  SELECT count(*)
  INTO current_rows
  FROM "sport_pricing" AS pricing
  JOIN "sports" AS sport
    ON sport."id" = pricing."sportId"
  WHERE sport."slug" IN (
    'badminton',
    'cricket',
    'football',
    'net-practice',
    'pickleball'
  );

  IF current_rows <> 30 THEN
    RAISE EXCEPTION
      'Expected exactly 30 existing Main SportPricing rows, found %',
      current_rows;
  END IF;

  WITH expected("slug", "duration", "price") AS (
    VALUES
      ('badminton', 60, 999),
      ('badminton', 120, 1799),
      ('badminton', 180, 2699),
      ('badminton', 240, 3599),
      ('badminton', 300, 4499),
      ('badminton', 720, 9999),
      ('cricket', 60, 999),
      ('cricket', 120, 1799),
      ('cricket', 180, 2699),
      ('cricket', 240, 3599),
      ('cricket', 300, 4499),
      ('cricket', 720, 9999),
      ('football', 60, 999),
      ('football', 120, 1799),
      ('football', 180, 2699),
      ('football', 240, 3599),
      ('football', 300, 4499),
      ('football', 720, 9999),
      ('pickleball', 60, 999),
      ('pickleball', 120, 1799),
      ('pickleball', 180, 2699),
      ('pickleball', 240, 3599),
      ('pickleball', 300, 4499),
      ('pickleball', 720, 9999),
      ('net-practice', 60, 299),
      ('net-practice', 120, 598),
      ('net-practice', 180, 897),
      ('net-practice', 240, 1196),
      ('net-practice', 300, 1495),
      ('net-practice', 720, 3588)
  )
  SELECT count(*)
  INTO current_rows
  FROM expected
  JOIN "sports" AS sport
    ON sport."slug" = expected."slug"
  JOIN "sport_pricing" AS pricing
    ON pricing."sportId" = sport."id"
    AND pricing."duration" = expected."duration"
    AND pricing."price" = expected."price"
    AND pricing."isActive" = true;

  IF current_rows <> 30 THEN
    RAISE EXCEPTION
      'Main SportPricing source values or active flags differ from the expected pre-migration state';
  END IF;
END $$;

DO $$
DECLARE
  inserted_rows INTEGER;
BEGIN
  WITH half_hour_prices("slug", "duration", "price") AS (
    VALUES
      ('badminton', 90, 1499),
      ('badminton', 150, 2299),
      ('badminton', 210, 3199),
      ('badminton', 270, 4099),
      ('badminton', 330, 5099),
      ('cricket', 90, 1499),
      ('cricket', 150, 2299),
      ('cricket', 210, 3199),
      ('cricket', 270, 4099),
      ('cricket', 330, 5099),
      ('football', 90, 1499),
      ('football', 150, 2299),
      ('football', 210, 3199),
      ('football', 270, 4099),
      ('football', 330, 5099),
      ('pickleball', 90, 1499),
      ('pickleball', 150, 2299),
      ('pickleball', 210, 3199),
      ('pickleball', 270, 4099),
      ('pickleball', 330, 5099),
      ('net-practice', 90, 449),
      ('net-practice', 150, 749),
      ('net-practice', 210, 1049),
      ('net-practice', 270, 1349),
      ('net-practice', 330, 1649)
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
    half_hour_prices."duration",
    half_hour_prices."price",
    true,
    NOW(),
    NOW()
  FROM half_hour_prices
  JOIN "sports" AS sport
    ON sport."slug" = half_hour_prices."slug";

  GET DIAGNOSTICS inserted_rows = ROW_COUNT;

  IF inserted_rows <> 25 THEN
    RAISE EXCEPTION
      'Expected 25 Main SportPricing inserts, inserted %',
      inserted_rows;
  END IF;
END $$;

DO $$
DECLARE
  updated_rows INTEGER;
BEGIN
  UPDATE "sport_pricing" AS pricing
  SET
    "price" = 4599,
    "updatedAt" = NOW()
  FROM "sports" AS sport
  WHERE pricing."sportId" = sport."id"
    AND sport."slug" IN (
      'badminton',
      'cricket',
      'football',
      'pickleball'
    )
    AND pricing."duration" = 300
    AND pricing."price" = 4499
    AND pricing."isActive" = true;

  GET DIAGNOSTICS updated_rows = ROW_COUNT;

  IF updated_rows <> 4 THEN
    RAISE EXCEPTION
      'Expected four standard-sport price updates, updated %',
      updated_rows;
  END IF;

  WITH net_updates("duration", "old_price", "new_price") AS (
    VALUES
      (120, 598, 599),
      (180, 897, 899),
      (240, 1196, 1199),
      (300, 1495, 1499),
      (720, 3588, 3599)
  )
  UPDATE "sport_pricing" AS pricing
  SET
    "price" = net_updates."new_price",
    "updatedAt" = NOW()
  FROM "sports" AS sport, net_updates
  WHERE pricing."sportId" = sport."id"
    AND sport."slug" = 'net-practice'
    AND pricing."duration" = net_updates."duration"
    AND pricing."price" = net_updates."old_price"
    AND pricing."isActive" = true;

  GET DIAGNOSTICS updated_rows = ROW_COUNT;

  IF updated_rows <> 5 THEN
    RAISE EXCEPTION
      'Expected five Net Practice price updates, updated %',
      updated_rows;
  END IF;
END $$;

DO $$
DECLARE
  final_rows INTEGER;
  matching_rows INTEGER;
  six_hour_rows INTEGER;
BEGIN
  SELECT count(*)
  INTO final_rows
  FROM "sport_pricing" AS pricing
  JOIN "sports" AS sport
    ON sport."id" = pricing."sportId"
  WHERE sport."slug" IN (
    'badminton',
    'cricket',
    'football',
    'net-practice',
    'pickleball'
  );

  WITH standard_prices("duration", "price") AS (
    VALUES
      (60, 999), (90, 1499), (120, 1799),
      (150, 2299), (180, 2699), (210, 3199),
      (240, 3599), (270, 4099), (300, 4599),
      (330, 5099), (720, 9999)
  ), net_prices("duration", "price") AS (
    VALUES
      (60, 299), (90, 449), (120, 599),
      (150, 749), (180, 899), (210, 1049),
      (240, 1199), (270, 1349), (300, 1499),
      (330, 1649), (720, 3599)
  ), expected AS (
    SELECT sport."id" AS "sportId", prices."duration", prices."price"
    FROM "sports" AS sport
    CROSS JOIN standard_prices AS prices
    WHERE sport."slug" IN (
      'badminton',
      'cricket',
      'football',
      'pickleball'
    )
    UNION ALL
    SELECT sport."id", prices."duration", prices."price"
    FROM "sports" AS sport
    CROSS JOIN net_prices AS prices
    WHERE sport."slug" = 'net-practice'
  )
  SELECT count(*)
  INTO matching_rows
  FROM expected
  JOIN "sport_pricing" AS pricing
    ON pricing."sportId" = expected."sportId"
    AND pricing."duration" = expected."duration"
    AND pricing."price" = expected."price"
    AND pricing."isActive" = true;

  SELECT count(*)
  INTO six_hour_rows
  FROM "sport_pricing" AS pricing
  JOIN "sports" AS sport
    ON sport."id" = pricing."sportId"
  WHERE sport."slug" IN (
    'badminton',
    'cricket',
    'football',
    'net-practice',
    'pickleball'
  )
    AND pricing."duration" = 360;

  IF final_rows <> 55 OR matching_rows <> 55 THEN
    RAISE EXCEPTION
      'Final Main SportPricing state is invalid: total %, matching %',
      final_rows,
      matching_rows;
  END IF;

  IF six_hour_rows <> 0 THEN
    RAISE EXCEPTION
      'Unexpected 360-minute Main SportPricing rows found: %',
      six_hour_rows;
  END IF;
END $$;

COMMIT;
