DO $$
DECLARE
  yoga_rows INTEGER;
  current_max_players INTEGER;
  updated_rows INTEGER;
BEGIN
  SELECT COUNT(*), MIN("maxPlayers")
  INTO yoga_rows, current_max_players
  FROM "sports"
  WHERE "slug" = 'yoga';

  IF yoga_rows <> 1 THEN
    RAISE EXCEPTION
      'Expected exactly one Yoga sport row, found %.',
      yoga_rows;
  END IF;

  IF current_max_players <> 25 THEN
    RAISE EXCEPTION
      'Expected Yoga maxPlayers to be 25, found %.',
      current_max_players;
  END IF;

  UPDATE "sports"
  SET "maxPlayers" = 30
  WHERE "slug" = 'yoga'
    AND "maxPlayers" = 25;

  GET DIAGNOSTICS updated_rows = ROW_COUNT;

  IF updated_rows <> 1 THEN
    RAISE EXCEPTION
      'Expected to update exactly one Yoga sport row, updated %.',
      updated_rows;
  END IF;
END $$;
