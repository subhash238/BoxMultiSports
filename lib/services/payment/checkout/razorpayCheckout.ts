// ==========================================
// Razorpay Checkout Helper
// ==========================================

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayCheckoutOptions
    ) => RazorpayInstance;
  }
}

// ==========================================
// Razorpay Types
// ==========================================

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;

  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };

  notes?: Record<string, string>;

  theme?: {
    color?: string;
  };

  handler?: (
    response: RazorpayPaymentResponse
  ) => void;

  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayInstance {
  open: () => void;
  close?: () => void;

  on?: (
    event: string,
    handler: (...args: unknown[]) => void
  ) => void;
}

// ==========================================
// Razorpay Script ID
// ==========================================

const RAZORPAY_SCRIPT_ID =
  "razorpay-checkout-script";

// ==========================================
// Load Razorpay Checkout Script
// ==========================================

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // -----------------------------------------
    // Browser Check
    // -----------------------------------------

    if (
      typeof window === "undefined"
    ) {
      resolve(false);
      return;
    }

    // -----------------------------------------
    // Already Loaded
    // -----------------------------------------

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // -----------------------------------------
    // Existing Script
    // -----------------------------------------

    const existingScript =
      document.getElementById(
        RAZORPAY_SCRIPT_ID
      ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => {
          resolve(
            !!window.Razorpay
          );
        },
        {
          once: true,
        }
      );

      existingScript.addEventListener(
        "error",
        () => {
          resolve(false);
        },
        {
          once: true,
        }
      );

      return;
    }

    // -----------------------------------------
    // Create Script
    // -----------------------------------------

    const script =
      document.createElement("script");

    script.id =
      RAZORPAY_SCRIPT_ID;

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    // -----------------------------------------
    // Script Loaded
    // -----------------------------------------

    script.onload = () => {
      resolve(
        !!window.Razorpay
      );
    };

    // -----------------------------------------
    // Script Failed
    // -----------------------------------------

    script.onerror = () => {
      console.error(
        "Failed to load Razorpay Checkout script."
      );

      resolve(false);
    };

    // -----------------------------------------
    // Add Script
    // -----------------------------------------

    document.head.appendChild(script);
  });
}

// ==========================================
// Open Razorpay Checkout
// ==========================================

export async function openRazorpayCheckout(
  options: RazorpayCheckoutOptions
): Promise<void> {
  // -----------------------------------------
  // Browser Check
  // -----------------------------------------

  if (
    typeof window === "undefined"
  ) {
    throw new Error(
      "Razorpay Checkout can only be opened in the browser."
    );
  }

  // -----------------------------------------
  // Validate Key
  // -----------------------------------------

  if (
    !options.key ||
    !options.key.trim()
  ) {
    throw new Error(
      "Razorpay public key is missing."
    );
  }

  // -----------------------------------------
  // Validate Order ID
  // -----------------------------------------

  if (
    !options.order_id ||
    !options.order_id.trim()
  ) {
    throw new Error(
      "Razorpay order ID is missing."
    );
  }

  // -----------------------------------------
  // Validate Amount
  // -----------------------------------------

  if (
    !Number.isFinite(options.amount) ||
    options.amount <= 0
  ) {
    throw new Error(
      "Invalid Razorpay payment amount."
    );
  }

  // -----------------------------------------
  // Load Razorpay
  // -----------------------------------------

  const loaded =
    await loadRazorpayScript();

  if (
    !loaded ||
    !window.Razorpay
  ) {
    throw new Error(
      "Unable to load Razorpay Checkout."
    );
  }

  // -----------------------------------------
  // Create Checkout Instance
  // -----------------------------------------

  const razorpay =
    new window.Razorpay(options);

  // -----------------------------------------
  // Validate Instance
  // -----------------------------------------

  if (
    !razorpay ||
    typeof razorpay.open !==
      "function"
  ) {
    throw new Error(
      "Unable to initialize Razorpay Checkout."
    );
  }

  // -----------------------------------------
  // Open Checkout
  // -----------------------------------------

  razorpay.open();
}