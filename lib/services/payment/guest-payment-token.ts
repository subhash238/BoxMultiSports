import crypto from "crypto";

export function generateGuestPaymentToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashGuestPaymentToken(rawToken: string): string {
  return crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
}

export function verifyGuestPaymentToken(
  rawToken: string,
  storedHash: string
): boolean {
  const submittedHash = Buffer.from(hashGuestPaymentToken(rawToken), "hex");
  const expectedHash = Buffer.from(storedHash, "hex");

  if (submittedHash.length !== expectedHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(submittedHash, expectedHash);
}
