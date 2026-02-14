import { z } from 'zod';

export const TransactionItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  type: z.enum(['CYLINDER', 'ACCESSORY', 'FUEL', 'REPAIR']),
  quantity: z.number().int().positive("Quantity must be positive"),
  unitPrice: z.number().nonnegative(),
  variant: z.string().optional(),
  name: z.string().optional(),
  size: z.string().optional(),
  regulator: z.string().optional(),
  description: z.string().optional(),
});

export const CreateTransactionSchema = z.object({
  customerId: z.string().optional(),
  customerType: z.enum(['Customer', 'Shop', 'Vehicle']).optional(),
  items: z.array(TransactionItemSchema).min(1, "At least one item is required"),
  paymentMethod: z.enum(['CASH', 'DIGITAL', 'DUE']).default('CASH'),
  type: z.enum(['SALE', 'RETURN', 'EXCHANGE', 'DUE_PAYMENT', 'EXPENSE']).default('SALE'),
  finalAmount: z.number().nonnegative().optional(), // Defaults to total
  paidAmount: z.number().nonnegative().default(0),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
