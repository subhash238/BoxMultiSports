-- Kids academy plan: ages 5-12, Rs 2000/month, 5-7 PM daily,
-- Cricket 4 days / Football 3 days / Pickleball 1 day. Shown first.
UPDATE "membership_plans"
SET
  "name"        = 'Kids Academy (Ages 5-12)',
  "description" = 'Admission open now. Daily coaching 5 PM - 7 PM for kids aged 5 to 12 years - cricket, football and pickleball with certified coaches.',
  "price"       = 2000,
  "durationDays" = 30,
  "features"    = ARRAY[
    'Ages 5 to 12 years',
    'Every day, 5 PM - 7 PM',
    'Cricket - 4 days',
    'Football - 3 days',
    'Pickleball - 1 day',
    'Certified coaches'
  ],
  "isActive"    = true,
  "sortOrder"   = 0,
  "updatedAt"   = NOW()
WHERE "slug" = 'kids-academy-monthly';
