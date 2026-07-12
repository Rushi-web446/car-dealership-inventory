import { z } from 'zod';

export const createVehicleSchema = z.object({
  make: z.string().trim().min(1, 'Make is required'),
  model: z.string().trim().min(1, 'Model is required'),
  category: z.string().trim().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;

export const formatVehicleValidationError = (error: z.ZodError) => {
  return {
    message: 'Validation failed',
    errors: error.issues.map(issue => issue.message),
  };
};
