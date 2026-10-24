import "server-only";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * Instagram long-lived tokens expire after 60 days
 * but can be refreshed (once older than 24h). We keep
 * the latest token in app_settings so the one in .env
 * only has to be set once.
 */

const TOKEN_KEY = "instagram_access_token";
const REFRESHED_AT_KEY = "instagram_token_refreshed_at";
const REFRESH_URL = "https://graph.instagram.com/refresh_access_token";
const REFRESH_EVERY_MS = 7 * 24 * 60 * 60 * 1000;

async function readSetting(key: string): Promise<string | null> {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch {
    return null;
  }
}

async function writeSetting(key: string, value: string): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getInstagramToken(): Promise<string | null> {
  const envToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim() || null;
  const storedToken = await readSetting(TOKEN_KEY);
  const envSeed = await readSetting(`${TOKEN_KEY}_seed`);

  // A new token pasted into .env replaces whatever we refreshed before.
  const useStored = storedToken && envToken && envSeed === envToken;
  const token = useStored ? storedToken : envToken;

  if (!token) {
    return null;
  }

  const refreshedAtRaw = useStored ? await readSetting(REFRESHED_AT_KEY) : null;
  const refreshedAt = refreshedAtRaw ? Number(refreshedAtRaw) : 0;

  if (Date.now() - refreshedAt < REFRESH_EVERY_MS) {
    return token;
  }

  try {
    const params = new URLSearchParams({
      grant_type: "ig_refresh_token",
      access_token: token,
    });
    const res = await fetch(`${REFRESH_URL}?${params.toString()}`, {
      cache: "no-store",
    });
    const data = (await res.json().catch(() => null)) as
      | { access_token?: string; expires_in?: number; error?: { message?: string } }
      | null;

    if (!res.ok || !data?.access_token) {
      // Fresh tokens (< 24h old) are not refreshable yet; try again later.
      logger.warn("Instagram token refresh skipped.", {
        status: res.status,
        error: data?.error?.message,
      });
      if (!useStored && envToken) {
        await writeSetting(`${TOKEN_KEY}_seed`, envToken);
        await writeSetting(TOKEN_KEY, envToken);
        await writeSetting(REFRESHED_AT_KEY, String(Date.now()));
      }
      return token;
    }

    await writeSetting(TOKEN_KEY, data.access_token);
    await writeSetting(REFRESHED_AT_KEY, String(Date.now()));
    if (envToken) {
      await writeSetting(`${TOKEN_KEY}_seed`, envToken);
    }

    logger.info("Instagram access token refreshed.", {
      expiresInDays: data.expires_in
        ? Math.round(data.expires_in / 86400)
        : undefined,
    });

    return data.access_token;
  } catch (error) {
    logger.warn("Instagram token refresh failed.", {
      error: error instanceof Error ? error.message : String(error),
    });
    return token;
  }
}
