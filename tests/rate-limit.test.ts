import { beforeEach, describe, expect, it } from "vitest";

import {
  enforceRateLimit,
  resetRateLimitStore,
} from "@/lib/rate-limit";
import { AppError } from "@/lib/errors";

const config = { limit: 3, windowSeconds: 60 };

describe("rate limiter", () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it("allows requests up to the limit", () => {
    for (let i = 0; i < 3; i++) {
      expect(() =>
        enforceRateLimit("test", "ip1", config)
      ).not.toThrow();
    }
  });

  it("throws 429 after the limit", () => {
    for (let i = 0; i < 3; i++) {
      enforceRateLimit("test", "ip1", config);
    }

    try {
      enforceRateLimit("test", "ip1", config);
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).statusCode).toBe(429);
    }
  });

  it("tracks keys independently", () => {
    for (let i = 0; i < 3; i++) {
      enforceRateLimit("test", "ip1", config);
    }

    expect(() =>
      enforceRateLimit("test", "ip2", config)
    ).not.toThrow();
  });

  it("tracks buckets independently", () => {
    for (let i = 0; i < 3; i++) {
      enforceRateLimit("a", "ip1", config);
    }

    expect(() =>
      enforceRateLimit("b", "ip1", config)
    ).not.toThrow();
  });
});
