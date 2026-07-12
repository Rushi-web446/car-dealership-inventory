import { z } from 'zod';

export const createVehicleSchema = z.object({
  make: z.string().trim().min(1, 'Make is required'),
  model: z.string().trim().min(1, 'Model is required'),
  category: z.string().trim().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;

export const restockVehicleSchema = z.object({
  quantity: z.number().int().gt(0, 'Quantity must be greater than zero'),
});

export type RestockVehicleInput = z.infer<typeof restockVehicleSchema>;

export const searchVehiclesSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0, 'minPrice must be non-negative').optional(),
  maxPrice: z.coerce.number().min(0, 'maxPrice must be non-negative').optional(),
}).refine(
  (data) => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  {
    message: 'minPrice must be less than or equal to maxPrice',
  }
);

export type SearchVehiclesInput = z.infer<typeof searchVehiclesSchema>;

export const formatVehicleValidationError = (error: z.ZodError) => {
  return {
    message: 'Validation failed',
    errors: error.issues.map(issue => issue.message),
  };
};
