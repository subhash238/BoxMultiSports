-- BoxMultiSports V1 sport records.
-- Safe to re-run: slug is the conflict key and existing rows are updated in place.

INSERT INTO sports
  ("id", "name", "slug", "pricePerHour", "maxPlayers", "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'Cricket', 'cricket', 999, 22, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Football', 'football', 999, 22, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Pickleball', 'pickleball', 999, 22, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Badminton', 'badminton', 999, 22, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Net Practice', 'net-practice', 299, 22, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Yoga', 'yoga', 399, 25, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Gym', 'gym', 399, 25, true, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "pricePerHour" = EXCLUDED."pricePerHour",
  "maxPlayers" = EXCLUDED."maxPlayers",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

UPDATE sports
SET
  "name" = 'Volleyball',
  "maxPlayers" = 11,
  "isActive" = false,
  "updatedAt" = NOW()
WHERE "slug" = 'vollyball';
