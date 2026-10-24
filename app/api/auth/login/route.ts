import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { enforceRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { AppError } from "@/lib/errors";
import { AUTH_COOKIE_NAMES } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  scope: z.enum(["customer", "admin"]).default("customer"),
});

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit("auth", getClientIp(request), RATE_LIMITS.AUTH);

    const body = await request.json();

    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password, scope } = result.data;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const passwordMatched = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatched) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    if (scope === "admin" && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "This account does not have admin access.",
        },
        { status: 403 }
      );
    }

    if (scope === "customer" && user.role === "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message:
            "This is an admin account. Please sign in from the admin login page.",
        },
        { status: 403 }
      );
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    // Create Response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });

    // Store JWT in HTTP-only Cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAMES[scope],
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 Days
    });

    return response;

  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
