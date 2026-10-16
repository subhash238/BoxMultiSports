import { describe, expect, it } from "vitest";

import {
  generateGuestPaymentToken,
  hashGuestPaymentToken,
  verifyGuestPaymentToken,
} from "@/lib/services/payment/guest-payment-token";

describe("guest payment token", () => {
  it("generates unique 64-char hex tokens", () => {
    const a = generateGuestPaymentToken();
    const b = generateGuestPaymentToken();

    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(b).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toBe(b);
  });

  it("verifies a token against its hash", () => {
    const token = generateGuestPaymentToken();
    const hash = hashGuestPaymentToken(token);

    expect(verifyGuestPaymentToken(token, hash)).toBe(true);
  });

  it("rejects a wrong token", () => {
    const hash = hashGuestPaymentToken(
      generateGuestPaymentToken()
    );

    expect(
      verifyGuestPaymentToken(
        generateGuestPaymentToken(),
        hash
      )
    ).toBe(false);
  });

  it("rejects malformed stored hash", () => {
    expect(
      verifyGuestPaymentToken(
        generateGuestPaymentToken(),
        "not-a-hash"
      )
    ).toBe(false);
  });
});
