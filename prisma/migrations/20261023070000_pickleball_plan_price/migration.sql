-- Pickleball monthly plan is Rs 2000/month.
UPDATE "membership_plans"
SET "price" = 2000, "updatedAt" = NOW()
WHERE "slug" = 'pickleball-monthly';
