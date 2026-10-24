import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      RAZORPAY_KEY_ID: "rzp_test_dummy",
      RAZORPAY_KEY_SECRET: "test_secret",
      RAZORPAY_WEBHOOK_SECRET: "test_webhook_secret",
      JWT_SECRET: "test_jwt_secret",
    },
  },
});
