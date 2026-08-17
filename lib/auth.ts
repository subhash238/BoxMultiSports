import { NextRequest } from "next/server";
import { prisma } from "./prisma";
import { AppError } from "./errors";
import jwt from "jsonwebtoken";

export interface AuthPayload {
  id: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AuthPayload;

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Get authenticated user's JWT payload
 */
export function getAuthPayload(request: NextRequest): AuthPayload {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    throw new AppError("Authentication required.", 401);
  }

  const payload = verifyToken(token);

  if (!payload) {
    throw new AppError("Invalid or expired token.", 401);
  }

  return payload;
}

/**
 * Get current authenticated user from database
 */
export async function getCurrentUser(request: NextRequest) {
  const auth = getAuthPayload(request);

  const user = await prisma.user.findUnique({
    where: {
      id: auth.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  return user;
}
