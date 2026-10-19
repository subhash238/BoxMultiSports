-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'CANCELLED');

-- CreateTable
CREATE TABLE "membership_plans" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "durationDays" INTEGER NOT NULL DEFAULT 30,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "membershipNumber" VARCHAR(30) NOT NULL,
    "planId" TEXT NOT NULL,
    "customerName" VARCHAR(100) NOT NULL,
    "customerEmail" VARCHAR(255) NOT NULL,
    "customerMobile" VARCHAR(15) NOT NULL,
    "notes" TEXT,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "paidAt" TIMESTAMP(3),
    "paymentTokenHash" VARCHAR(64),
    "paymentTokenExpiresAt" TIMESTAMP(3),
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "membership_plans_slug_key" ON "membership_plans"("slug");
CREATE UNIQUE INDEX "memberships_membershipNumber_key" ON "memberships"("membershipNumber");
CREATE UNIQUE INDEX "memberships_razorpayOrderId_key" ON "memberships"("razorpayOrderId");
CREATE UNIQUE INDEX "memberships_razorpayPaymentId_key" ON "memberships"("razorpayPaymentId");
CREATE UNIQUE INDEX "memberships_paymentTokenHash_key" ON "memberships"("paymentTokenHash");
CREATE INDEX "memberships_planId_idx" ON "memberships"("planId");
CREATE INDEX "memberships_status_idx" ON "memberships"("status");
CREATE INDEX "memberships_customerMobile_idx" ON "memberships"("customerMobile");
CREATE INDEX "memberships_endDate_idx" ON "memberships"("endDate");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_planId_fkey" FOREIGN KEY ("planId") REFERENCES "membership_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed default plans
INSERT INTO "membership_plans" ("id", "slug", "name", "description", "price", "durationDays", "features", "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES
  (
    'plan_pickleball_monthly',
    'pickleball-monthly',
    'Pickleball Membership',
    'Unlimited pickleball access for the whole month. Perfect for regular players.',
    3000,
    30,
    ARRAY['Unlimited play sessions', 'Priority slot booking', 'All days access'],
    true,
    1,
    NOW(),
    NOW()
  ),
  (
    'plan_kids_academy_monthly',
    'kids-academy-monthly',
    'Kids Training Academy',
    'Professional coaching for kids - cricket and football, every week.',
    2000,
    30,
    ARRAY['Training 5 PM - 7 PM', '4 days Cricket / week', '2 days Football / week', 'Certified coaches'],
    true,
    2,
    NOW(),
    NOW()
  )
ON CONFLICT ("slug") DO NOTHING;
