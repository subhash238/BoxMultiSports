// ==========================================
// Create Razorpay Order - Client Helper
// ==========================================

export interface CreateRazorpayOrderResponse {
  success: boolean;

  message: string;

  payment?: {
    id: string;
    bookingId: string;
    amount: number | string;
    currency: string;
    status: string;
    razorpayOrderId: string | null;
  };

  order?: {
    id: string;
    amount: number;
    currency: string;
    receipt?: string;
    status?: string;
  };
}

// ==========================================
// Create Razorpay Order
// ==========================================

export async function createRazorpayOrder(
  bookingId: string,
  guestPaymentToken: string | null
): Promise<CreateRazorpayOrderResponse> {
  // -----------------------------------------
  // Validate Booking ID
  // -----------------------------------------

  if (!bookingId) {
    throw new Error(
      "Booking ID is required."
    );
  }

  // -----------------------------------------
  // Call API
  // -----------------------------------------

  const response = await fetch(
    "/api/payments/create-order",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        bookingId,
        guestPaymentToken,
      }),
    }
  );

  // -----------------------------------------
  // Read Response
  // -----------------------------------------

  const data =
    await response.json();

  // -----------------------------------------
  // Handle API Error
  // -----------------------------------------

  if (!response.ok || !data.success) {
    throw new Error(
      data?.message ||
        "Unable to create Razorpay order."
    );
  }

  // -----------------------------------------
  // Return Success
  // -----------------------------------------

  return data;
}
