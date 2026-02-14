import { z } from 'zod';

export const shopSchema = z.object({
  name: z.string().min(1, "Name is required"),
  ownerName: z.string().optional(),
  phone: z.string().min(11, "Invalid phone number"), // E.g., 017...
  address: z.string().min(1, "Address is required"),
  district: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type ShopInput = z.infer<typeof shopSchema>;
