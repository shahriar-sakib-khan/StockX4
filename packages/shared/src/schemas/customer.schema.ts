import { z } from 'zod';

export const customerSchema = z.object({
  type: z.enum(['retail', 'wholesale']).default('retail'),
  name: z.string().min(1, "Name is required"),
  ownerName: z.string().optional(),
  phone: z.string().min(11, "Invalid phone number"),
  address: z.string().optional(),
  district: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
