import { z } from "zod";

export const createStoreSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50),
  slug: z.string().min(3).max(20).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric").optional(),
  settings: z.object({
    currency: z.string().default("USD"),
    timezone: z.string().default("UTC"),
  }).optional(),
});

export const updateStoreSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  settings: z.object({
    currency: z.string().optional(),
    timezone: z.string().optional(),
  }).optional(),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;

export const storeResponseSchema = z.object({
  _id: z.string(),
  ownerId: z.string(),
  name: z.string(),
  slug: z.string(),
  settings: z.object({
    currency: z.string(),
    timezone: z.string(),
  }).optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type StoreResponse = z.infer<typeof storeResponseSchema>;
