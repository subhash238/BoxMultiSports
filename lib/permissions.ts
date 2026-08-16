import { AuthPayload } from "./auth";

/**
 * Ensures the authenticated user is an Admin.
 */
export function requireAdmin(user: AuthPayload): void {
  if (user.role !== "ADMIN") {
    throw new Error("Access denied. Admin privileges required.");
  }
}

/**
 * Ensures the authenticated user is a Customer.
 */
export function requireCustomer(user: AuthPayload): void {
  if (user.role !== "CUSTOMER") {
    throw new Error("Access denied. Customer privileges required.");
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
    throw new Error("Access denied.");
  }
}