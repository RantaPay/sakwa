import { z } from "zod";
import { ROLES } from "@sakwa/types";

export const createUserSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.email(),
  phone: z.string().trim().min(7).max(20),
  roles: z.array(z.enum(ROLES)).min(1, "Assign at least one role."),
  primaryRole: z.enum(ROLES),
});

export const warehouseSchema = z.object({
  name: z.string().trim().min(2).max(80),
  location: z.string().trim().max(160).optional().or(z.literal("")),
});

export const warehouseStaffSchema = z.object({
  warehouseId: z.uuid(),
  userId: z.uuid(),
});
