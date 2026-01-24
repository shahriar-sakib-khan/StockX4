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
  logo: z.string().url('Logo must be a valid URL').optional(),
  // Identity Colors
  color20mm: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid Hex Color'),
  color22mm: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid Hex Color'),

  // Variants
  variants: z.array(z.object({
    size: CylinderSize,
    regulator: RegulatorType,
    image: z.string().url('Image must be a valid URL').optional(),
    cylinderImage: z.string().url('Cylinder Image must be a valid URL').optional(),
  })).min(1, 'At least one variant is required'),
});

export type GlobalBrandInput = z.infer<typeof globalBrandSchema>;
