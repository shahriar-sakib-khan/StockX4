import { z } from "zod";

export const StaffRole = z.enum(["manager", "cashier", "staff", "driver"]);

export const createStaffSchema = z.object({
  name: z.string().min(2, "Name is required"),
  staffId: z.string().min(3, "Staff ID must be at least 3 characters").regex(/^[a-zA-Z0-9@._-]+$/, "Staff ID must be alphanumeric or valid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: StaffRole.default("staff"),
});

export const updateStaffSchema = z.object({
  name: z.string().min(2).optional(),
  role: StaffRole.optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export const staffLoginSchema = z.object({
  storeId: z.string().min(1, "Store ID is required"),
  staffId: z.string().min(1, "Staff ID is required"),
  password: z.string().min(1, "Password is required"),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type StaffLoginInput = z.infer<typeof staffLoginSchema>;
