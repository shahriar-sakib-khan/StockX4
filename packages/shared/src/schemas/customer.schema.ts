import { z } from 'zod';

export const customerSchema = z.object({
  type: z.enum(['retail', 'wholesale']).default('retail'),
  name: z.string().min(1, "Name is required"),
  ownerName: z.string().optional(),
  phone: z.string().min(11, "Invalid phone number"),
  address: z.string().optional(),
  district: z.string().optional(),
  imageUrl: z.string().optional(),
  dueCylinders: z.array(z.object({
    productId: z.string(),
    brandName: z.string(),
    quantity: z.number().int().nonnegative()
  })).optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
