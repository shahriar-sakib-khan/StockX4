import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(11, "Invalid phone number"),
  address: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
