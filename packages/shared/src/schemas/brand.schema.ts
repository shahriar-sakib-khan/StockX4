import { z } from 'zod';

export const CylinderSize = z.string().min(1, "Size is required");
export const CylinderSizeOptions = [
  '5.5kg (mini)', '12kg', '12.5kg', '15kg', '20kg', '25kg',
  '30kg', '33kg', '35kg', '45kg', '50kg'
];
export const RegulatorType = z.enum(['20mm', '22mm']);

// --- Global Brand (Admin) ---
export const globalBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  logo: z.string().min(1, 'Logo URL is required'),
  cylinderImage: z.string().min(1, 'Cylinder Image is required'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid Hex Color'),
  type: z.enum(['cylinder', 'stove', 'regulator']).default('cylinder'),
  isActive: z.boolean().default(true).optional(),
});

export type GlobalBrandInput = z.infer<typeof globalBrandSchema>;
