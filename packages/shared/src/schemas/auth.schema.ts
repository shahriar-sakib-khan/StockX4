import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(10, 'Invalid phone number').optional(),
  password: z.string().min(1, 'Password is required'),
});

export const unifiedLoginSchema = z.object({
  identifier: z.string().min(4, 'Email or Phone is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UnifiedLoginInput = z.infer<typeof unifiedLoginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
