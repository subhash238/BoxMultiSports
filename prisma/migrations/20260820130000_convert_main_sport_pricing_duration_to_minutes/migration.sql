UPDATE "sport_pricing" AS "sp"
SET "duration" = "sp"."duration" * 60
FROM "sports" AS "s"
WHERE "sp"."sportId" = "s"."id"
  AND "s"."slug" IN (
    'badminton',
    'cricket',
    'football',
    'net-practice',
    'pickleball'
  )
  AND "sp"."duration" IN (1, 2, 3, 4, 5, 12);
