import { z } from "zod";

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

export const createMembershipSchema = z.object({
  planSlug: z.string().trim().min(1, "Plan is required."),

  fullName: z
    .string()
    .trim()
    .min(1, "Please enter a valid full name.")
    .max(100, "Please enter a valid full name.")
    .regex(/^[A-Za-z]/, "Please enter a valid full name."),

  email: z
    .string()
    .trim()
    .min(1, "Please enter a valid email address.")
    .max(255, "Please enter a valid email address.")
    .email("Please enter a valid email address."),

  mobile: z
    .string()
    .trim()
    .length(10, "Mobile number must be exactly 10 digits.")
    .regex(/^[6-9]\d{9}$/, "Please enter a valid Indian mobile number."),

  startDate: z
    .string()
    .trim()
    .regex(isoDate, "Start date must be YYYY-MM-DD.")
    .optional(),

  paymentMethod: z.enum(["ONLINE", "PAY_AT_VENUE"]).optional(),

  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters.")
    .transform((value) => value || undefined)
    .optional(),
});

export type CreateMembershipInput = z.infer<
  typeof createMembershipSchema
>;

export const membershipPaymentSchema = z.object({
  membershipId: z.string().trim().min(1, "Membership ID is required."),
  paymentToken: z.string().trim().min(1, "Payment token is required."),
});

export const verifyMembershipPaymentSchema =
  membershipPaymentSchema.extend({
    razorpay_order_id: z.string().trim().min(1),
    razorpay_payment_id: z.string().trim().min(1),
    razorpay_signature: z.string().trim().min(1),
  });

export const updateMembershipStatusSchema = z.object({
  status: z.enum(["ACTIVE", "CANCELLED"]),
});
