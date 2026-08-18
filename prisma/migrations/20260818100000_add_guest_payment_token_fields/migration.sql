-- AlterTable
ALTER TABLE "bookings"
ADD COLUMN "guestPaymentTokenHash" VARCHAR(64),
ADD COLUMN "guestPaymentTokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "bookings_guestPaymentTokenHash_key" ON "bookings"("guestPaymentTokenHash");
