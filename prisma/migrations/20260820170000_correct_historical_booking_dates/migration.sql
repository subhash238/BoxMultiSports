BEGIN;

-- Correct only counters whose date is proven to belong to a set of
-- one-day-early bookings with the same intended date and maximum sequence.
-- Descending order prevents transient unique-key collisions between
-- consecutive dates whose counters all move forward by one day.
DO $$
DECLARE
  candidate RECORD;
BEGIN
  FOR candidate IN
    WITH audited_bookings AS (
      SELECT
        "bookingDate",
        to_date(
          substring("bookingNumber" FROM 5 FOR 8),
          'YYYYMMDD'
        ) AS intended_date,
        substring("bookingNumber" FROM 14 FOR 6)::integer AS sequence
      FROM "bookings"
      WHERE "bookingNumber" ~ '^BMS-[0-9]{8}-[0-9]{6}$'
        AND to_char(
          to_date(
            substring("bookingNumber" FROM 5 FOR 8),
            'YYYYMMDD'
          ),
          'YYYYMMDD'
        ) = substring("bookingNumber" FROM 5 FOR 8)
        AND ("startTime" AT TIME ZONE 'Asia/Kolkata')::date =
          to_date(
            substring("bookingNumber" FROM 5 FOR 8),
            'YYYYMMDD'
          )
    ),
    booking_groups AS (
      SELECT
        intended_date,
        max(sequence) AS max_sequence,
        bool_and("bookingDate" = intended_date - 1) AS all_one_day_early
      FROM audited_bookings
      GROUP BY intended_date
    ),
    base_counter_candidates AS (
      SELECT
        counter."id" AS counter_id,
        counter."bookingDate" AS current_date,
        booking_group.intended_date
      FROM "booking_counters" AS counter
      JOIN booking_groups AS booking_group
        ON booking_group.intended_date = counter."bookingDate" + 1
      WHERE booking_group.all_one_day_early
        AND booking_group.max_sequence = counter."lastNumber"
    ),
    safe_counter_candidates AS (
      SELECT base_candidate.*
      FROM base_counter_candidates AS base_candidate
      WHERE NOT EXISTS (
        SELECT 1
        FROM "booking_counters" AS target_counter
        WHERE target_counter."bookingDate" = base_candidate.intended_date
          AND target_counter."id" NOT IN (
            SELECT counter_id
            FROM base_counter_candidates
          )
      )
    )
    SELECT
      counter_id,
      current_date,
      intended_date
    FROM safe_counter_candidates
    ORDER BY intended_date DESC
  LOOP
    UPDATE "booking_counters"
    SET "bookingDate" = candidate.intended_date
    WHERE "id" = candidate.counter_id
      AND "bookingDate" = candidate.current_date;
  END LOOP;
END $$;

-- Correct only bookings for which all three calendar-date signals agree:
-- booking number date = IST start date, while bookingDate is exactly one day early.
WITH audited_bookings AS (
  SELECT
    "id",
    "bookingDate",
    to_date(
      substring("bookingNumber" FROM 5 FOR 8),
      'YYYYMMDD'
    ) AS intended_date
  FROM "bookings"
  WHERE "bookingNumber" ~ '^BMS-[0-9]{8}-[0-9]{6}$'
    AND to_char(
      to_date(
        substring("bookingNumber" FROM 5 FOR 8),
        'YYYYMMDD'
      ),
      'YYYYMMDD'
    ) = substring("bookingNumber" FROM 5 FOR 8)
    AND ("startTime" AT TIME ZONE 'Asia/Kolkata')::date =
      to_date(
        substring("bookingNumber" FROM 5 FOR 8),
        'YYYYMMDD'
      )
)
UPDATE "bookings" AS booking
SET "bookingDate" = audited_booking.intended_date
FROM audited_bookings AS audited_booking
WHERE booking."id" = audited_booking."id"
  AND booking."bookingDate" = audited_booking.intended_date - 1;

COMMIT;
