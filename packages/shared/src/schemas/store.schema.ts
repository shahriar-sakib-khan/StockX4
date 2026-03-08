import { z } from "zod";

export const createStoreSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50),
  slug: z.string().min(3).max(20).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric").optional(),
  code: z.string().optional(),
  location: z.string().optional(),
  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),
  settings: z.object({
    currency: z.string().default("BDT"),
    timezone: z.string().default("Asia/Dhaka"),
  }).optional(),
  isSetupComplete: z.boolean().default(false),
});

export const updateStoreSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  code: z.string().optional(),
  location: z.string().optional(),
  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),
  settings: z.object({
    currency: z.string().optional(),
    timezone: z.string().optional(),
  }).optional(),
  cylinderSizes: z.array(z.string()).optional(),
  archivedCylinderSizes: z.array(z.string()).optional(),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;

export const storeResponseSchema = z.object({
  _id: z.string(),
  ownerId: z.string(),
  name: z.string(),
  slug: z.string(),
  code: z.string(),
  location: z.string().optional(),
  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),
  settings: z.object({
    currency: z.string(),
    timezone: z.string(),
  }).optional(),
  cylinderSizes: z.array(z.string()).optional(),
  archivedCylinderSizes: z.array(z.string()).optional(),
  isSetupComplete: z.boolean().default(false),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type StoreResponse = z.infer<typeof storeResponseSchema>;

export const setupStoreSchema = z.object({
  name: z.string().min(3),
  location: z.string().optional(),
  code: z.string().optional(),
  brandIds: z.array(z.string()).min(1),
  cylinders: z.array(z.object({
      brandId: z.string(),
      size: z.string(),          // e.g. '5.5kg', '12kg', '35kg', or custom
      regulatorType: z.union([z.literal('22mm'), z.literal('20mm')]),
      counts: z.object({
          packaged: z.number().min(0).default(0),
          refill: z.number().min(0).default(0),
          empty: z.number().min(0).default(0),
          defected: z.number().min(0).default(0),
      }),
      prices: z.object({
          packaged: z.object({
              buying: z.number().min(0).default(0),
              retail: z.number().min(0).default(0),
              wholesale: z.number().min(0).default(0),
          }),
          refill: z.object({
              buying: z.number().min(0).default(0),
              retail: z.number().min(0).default(0),
              wholesale: z.number().min(0).default(0),
          }),
      }),
  })),
  cylinderSizes: z.array(z.string()).optional(), // store-level size configuration
});

export type SetupStoreInput = z.infer<typeof setupStoreSchema>;
