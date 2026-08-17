-- CreateEnum
CREATE TYPE "BookingStatusActorType" AS ENUM ('ADMIN', 'CUSTOMER', 'GUEST', 'PAYMENT', 'SYSTEM');

-- Add actor type as nullable for the existing history rows
ALTER TABLE "booking_status_history"
ADD COLUMN "actorType" "BookingStatusActorType";

-- Backfill the reviewed legacy payment-verification history rows
UPDATE "booking_status_history"
SET "actorType" = 'PAYMENT'
WHERE "actorType" IS NULL;

-- Enforce actor type for all future history rows
ALTER TABLE "booking_status_history"
ALTER COLUMN "actorType" SET NOT NULL;

-- Allow non-user actors while preserving the existing foreign key
-- semantics for non-null changedById values.
ALTER TABLE "booking_status_history"
ALTER COLUMN "changedById" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "booking_status_history_actorType_idx"
ON "booking_status_history"("actorType");
