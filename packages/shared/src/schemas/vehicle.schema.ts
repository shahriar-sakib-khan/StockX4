import { z } from 'zod';

export const vehicleSchema = z.object({
  licensePlate: z.string().min(1, "License plate is required"), // E.g., "DHAKA-METRO-KA..."
  vehicleModel: z.string().optional(),    // E.g., "Tata Ace"
  driverName: z.string().optional(), // Simple string for now
  driverPhone: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
