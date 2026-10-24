import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { NotificationService } from "@/lib/services/notification/email.service";
import { AppError } from "@/lib/errors";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  mobile: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9 -]{8,14}$/, "Please enter a valid mobile number."),
  email: z.email().optional().or(z.literal("")),
  message: z.string().trim().min(5).max(2000),
});

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit("contact", getClientIp(request), RATE_LIMITS.CONTACT);

    const result = contactSchema.safeParse(await request.json());

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, mobile, email, message } = result.data;

    const emailed = await NotificationService.sendEnquiry({
      name,
      mobile,
      email: email || undefined,
      message,
    });

    return NextResponse.json({ success: true, emailed });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
