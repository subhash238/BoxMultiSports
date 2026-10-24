-- Generic key/value store for runtime settings
-- (e.g. refreshed Instagram access token).
CREATE TABLE "app_settings" (
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("key")
);
