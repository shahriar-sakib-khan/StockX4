import { z } from "zod";

export const StaffRole = z.enum(["manager", "staff"]);

export const createStaffSchema = z.object({
  name: z.string().min(2, "Name is required"),
  staffId: z.string().min(3, "Staff ID must be at least 3 characters").regex(/^[a-zA-Z0-9@._-]+$/, "Staff ID must be alphanumeric or valid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: StaffRole.default("staff"),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  salary: z.coerce.number().min(0, "Salary must be positive").default(0),
  salaryDue: z.coerce.number().default(0),
  phone: z.string().min(11, "Phone number must be at least 11 digits").optional(),
});

export const updateStaffSchema = z.object({
  name: z.string().min(2).optional(),
  role: StaffRole.optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  salary: z.coerce.number().min(0, "Salary must be positive").optional(),
  salaryDue: z.coerce.number().optional(),
  phone: z.string().min(11, "Phone number must be at least 11 digits").optional(),
});

export const staffLoginSchema = z.object({
  storeId: z.string().min(1, "Store ID is required"),
  staffId: z.string().min(1, "Staff ID is required"),
  password: z.string().min(1, "Password is required"),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type StaffLoginInput = z.infer<typeof staffLoginSchema>;
