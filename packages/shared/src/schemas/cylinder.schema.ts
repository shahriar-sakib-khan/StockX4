import { z } from 'zod';

// --- Store Inventory (Local) ---
// Used when updating stock/prices
export const updateInventorySchema = z.object({
  counts: z.object({
    full: z.number().int().min(0).optional(),
    empty: z.number().int().min(0).optional(),
    defected: z.number().int().min(0).optional(),
  }).optional(),
  prices: z.object({
    fullCylinder: z.number().min(0).optional(),
    gasOnly: z.number().min(0).optional(),
  }).optional(),
});

export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;

// Input for subscribing to a brand
export const subscribeBrandSchema = z.object({
  globalBrandId: z.string().min(1, 'Global Brand ID is required'),
});

export type SubscribeBrandInput = z.infer<typeof subscribeBrandSchema>;

// Batch Input
export const subscribeBatchBrandSchema = z.object({
  globalBrandIds: z.array(z.string().min(1)).min(1, 'At least one brand is required'),
});

export type SubscribeBatchBrandInput = z.infer<typeof subscribeBatchBrandSchema>;
