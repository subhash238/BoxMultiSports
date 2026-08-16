-- CreateTable
CREATE TABLE "sport_pricing" (
    "id" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sport_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sport_pricing_sportId_idx" ON "sport_pricing"("sportId");

-- CreateIndex
CREATE UNIQUE INDEX "sport_pricing_sportId_duration_key" ON "sport_pricing"("sportId", "duration");

-- AddForeignKey
ALTER TABLE "sport_pricing" ADD CONSTRAINT "sport_pricing_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "sports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
