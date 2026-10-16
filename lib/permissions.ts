import { NextRequest } from "next/server";

import { AppError } from "./errors";
import { AuthPayload, getCurrentUser } from "./auth";

/**
 * Ensures the authenticated user is an Admin.
 */
export function requireAdmin(user: AuthPayload): void {
  if (user.role !== "ADMIN") {
    throw new AppError("Access denied. Admin privileges required.", 403);
  }
}

/**
 * Ensures the authenticated user is a Customer.
 */
export function requireCustomer(user: AuthPayload): void {
  if (user.role !== "CUSTOMER") {
    throw new AppError("Access denied. Customer privileges required.", 403);
  }
}

/**
 * Checks whether the user has one of the allowed roles.
 */
export function requireRole(
  user: AuthPayload,
  allowedRoles: AuthPayload["role"][]
): void {
  if (!allowedRoles.includes(user.role)) {
    throw new AppError("Access denied.", 403);
  }
}

/**
 * Authenticates the request and returns the
 * current user only when they are an admin.
 * Throws AppError(401) unauthenticated and
 * AppError(403) non-admin.
 */
export async function requireAdminUser(request: NextRequest) {
  const user = await getCurrentUser(request);
  requireAdmin({ id: user.id, email: user.email, role: user.role });
  return user;
}
