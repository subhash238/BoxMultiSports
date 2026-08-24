-- CreateEnum
CREATE TYPE "PaymentRecoveryState" AS ENUM ('REVIEW_REQUIRED', 'REFUND_PENDING', 'RESOLVED');

-- AlterTable
ALTER TABLE "payments" ADD COLUMN "recoveryState" "PaymentRecoveryState";
