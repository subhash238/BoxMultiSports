-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_userId_fkey";

-- Add guest contact fields as nullable during backfill
ALTER TABLE "bookings"
ADD COLUMN "customerMobile" TEXT,
ADD COLUMN "customerName" TEXT;

-- Backfill existing bookings from their related users
UPDATE "bookings" AS b
SET
  "customerName" = u."name",
  "customerMobile" = u."mobile"
FROM "users" AS u
WHERE u."id" = b."userId";

-- Enforce required guest contact fields
ALTER TABLE "bookings"
ALTER COLUMN "customerMobile" SET NOT NULL,
ALTER COLUMN "customerName" SET NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
