/*
  Warnings:

  - You are about to drop the column `image` on the `sports` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sports" DROP COLUMN "image",
ADD COLUMN     "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "booking_counters" (
    "id" SERIAL NOT NULL,
    "bookingDate" DATE NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_counters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "booking_counters_bookingDate_key" ON "booking_counters"("bookingDate");
