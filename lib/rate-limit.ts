import { NextRequest } from "next/server";

import { AppError } from "./errors";

/**
 * ==========================================
 * In-Memory Sliding Window Rate Limiter
 * ==========================================
 *
 * Suitable for a single-instance deployment.
 * For multi-instance deployments replace the
 * store with Redis or another shared backend
 * behind the same interface.
 */

interface RateLimitBucketConfig {
  /** Maximum requests allowed inside the window. */
  limit: number;
  /** Window length in seconds. */
  windowSeconds: number;
}

interface BucketEntry {
  timestamps: number[];
}

const buckets = new Map<string, BucketEntry>();

/**
 * Named buckets so different routes get
 * independent limits.
 */
export const RATE_LIMITS = {
  AUTH: { limit: 5, windowSeconds: 60 },
  BOOKING_CREATE: { limit: 10, windowSeconds: 60 },
  PAYMENT: { limit: 10, windowSeconds: 60 },
} as const satisfies Record<string, RateLimitBucketConfig>;

function pruneOldEntries(now: number): void {
  // Keep memory bounded on long-running servers.
  if (buckets.size < 10_000) {
    return;
  }

  for (const [key, entry] of buckets) {
    if (
      entry.timestamps.length === 0 ||
      now - entry.timestamps[entry.timestamps.length - 1] > 60 * 60 * 1000
    ) {
      buckets.delete(key);
    }
  }
}

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Throws AppError(429) when the key exceeds the
 * configured limit. Returns remaining allowance.
 */
export function enforceRateLimit(
  bucketName: string,
  key: string,
  config: RateLimitBucketConfig
): { remaining: number } {
  const now = Date.now();
  const windowStart = now - config.windowSeconds * 1000;
  const mapKey = `${bucketName}:${key}`;

  pruneOldEntries(now);

  const entry = buckets.get(mapKey) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  if (entry.timestamps.length >= config.limit) {
    throw new AppError(
      "Too many requests. Please try again later.",
      429
    );
  }

  entry.timestamps.push(now);
  buckets.set(mapKey, entry);

  return { remaining: config.limit - entry.timestamps.length };
}

/** Test hook: clears all buckets. */
export function resetRateLimitStore(): void {
  buckets.clear();
}
