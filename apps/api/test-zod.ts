import { z } from 'zod';

const setupStoreSchema = z.object({
  name: z.string().min(3),
  location: z.string().optional(),
  code: z.string().optional(),
  brandIds: z.array(z.string()).min(1),
  cylinders: z.array(z.object({
      brandId: z.string(),
      size: z.string(),
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
  cylinderSizes: z.array(z.string()).optional(),
});

const payload = {
  name: 'Test Store',
  location: '',
  code: '',
  brandIds: ['123', '456'],
  cylinders: [
    {
      brandId: '123',
      size: '5kg',
      regulatorType: '22mm',
      counts: { packaged: 4, refill: 0, empty: 0, defected: 0 },
      prices: {
        packaged: { buying: 0, retail: 0, wholesale: 0 },
        refill: { buying: 0, retail: 0, wholesale: 0 }
      }
    }
  ],
  cylinderSizes: ['5kg', '12kg']
};

const result = setupStoreSchema.safeParse(payload);
if (!result.success) {
  console.log('FAILED:', JSON.stringify(result.error.errors, null, 2));
} else {
  console.log('SUCCESS');
}
