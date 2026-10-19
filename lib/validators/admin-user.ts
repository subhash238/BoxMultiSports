import { z } from "zod";

export const updateUserRoleSchema = z.object({
  role: z.enum(["ADMIN", "CUSTOMER"]),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
