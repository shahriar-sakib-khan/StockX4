import { z } from "zod";

export const StaffRole = z.enum(["owner", "manager", "staff", "driver"]);

// contact = phone number OR email — at least one meaningful identifier
const contactValidator = z.string().min(4, "Phone or email is required");

export const createStaffSchema = z.object({
  name: z.string().min(2, "Name is required"),
  contact: contactValidator, // phone OR email — acts as unique key within store
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: StaffRole.default("staff"),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  salary: z.coerce.number().min(0, "Salary must be positive").default(0),
  salaryDue: z.coerce.number().default(0),
  salaryEnabled: z.boolean().default(true),
});

export const updateStaffSchema = z.object({
  name: z.string().min(2).optional(),
  contact: contactValidator.optional(),
  role: StaffRole.optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  salary: z.coerce.number().min(0, "Salary must be positive").optional(),
  salaryDue: z.coerce.number().optional(),
  salaryEnabled: z.boolean().optional(),
});

export const staffLoginSchema = z.object({
  storeId: z.string().min(1, "Store ID is required"),
  contact: z.string().min(1, "Phone / Email is required"),
  password: z.string().min(1, "Password is required"),
});

export type StaffRoleType = z.infer<typeof StaffRole>;
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type StaffLoginInput = z.infer<typeof staffLoginSchema>;
