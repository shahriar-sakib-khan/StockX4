import { z } from 'zod';

export const ProductType = z.enum(["stove", "regulator", "pipe", "accessory", "other"]);

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  type: ProductType,
  brand: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(), // Cloudinary URL

  // Specific Attributes
  modelNumber: z.string().optional(),
  burnerCount: z.enum(['1', '2', '3', '4']).optional(), // For stoves
  size: z.enum(['20mm', '22mm']).optional(), // For regulators

  // Inventory
  stock: z.number().int().min(0).default(0),
  damagedStock: z.number().int().min(0).default(0),
  lowStockAlert: z.number().int().min(0).default(5),

  // Pricing
  costPrice: z.number().min(0, "Cost price must be positive").default(0), // Buying price (for profit calc)
  sellingPrice: z.number().min(0, "Selling price must be positive").default(0), // Retail price
});

export type ProductInput = z.infer<typeof productSchema>;
