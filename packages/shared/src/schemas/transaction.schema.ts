import { z } from 'zod';

export const TransactionItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  type: z.enum(['CYLINDER', 'ACCESSORY', 'EXPENSE', 'REFILL', 'EMPTY', 'PACKAGED', 'SERVICE', 'FUEL', 'REPAIR', 'REFUND']),
  category: z.string().optional(),
  quantity: z.number().int().positive("Quantity must be positive"),
  unitPrice: z.number().nonnegative(),
  wholesalePrice: z.number().nonnegative().optional(),
  retailPrice: z.number().nonnegative().optional(),
  variant: z.string().optional(),
  name: z.string().optional(),
  size: z.string().optional(),
  regulator: z.string().optional(),
  description: z.string().optional(),
  saleType: z.enum(['PACKAGED', 'REFILL', 'RETURN', 'DUE']).optional(),
  burners: z.number().optional(),
  isReturn: z.boolean().optional(),
  isSettled: z.boolean().optional(),
});

export const CreateTransactionSchema = z.object({
  customerId: z.string().optional(),
  customerType: z.enum(['retail', 'wholesale', 'Customer', 'Shop', 'Vehicle']).optional(),
  items: z.array(TransactionItemSchema).min(1, "At least one item is required"),
  paymentMethod: z.enum(['CASH', 'DIGITAL', 'DUE']).default('CASH'),
  type: z.enum(['SALE', 'RETURN', 'EXCHANGE', 'DUE_PAYMENT', 'EXPENSE', 'DUE_CYLINDER_SETTLEMENT']).default('SALE'),
  finalAmount: z.number().nonnegative().optional(), // Defaults to total
  paidAmount: z.number().nonnegative().default(0),
  transactorName: z.string().optional(),
  transactorRole: z.string().optional(),
  dueCylinders: z.array(z.object({
    productId: z.string(),
    brandName: z.string(),
    quantity: z.number().int().positive(),
    size: z.string().optional(),
    regulator: z.string().optional(),
    image: z.string().optional(),
  })).optional(),
  receiptUrl: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
