import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { VehicleService } from '../services/vehicle.service';
import {
  createVehicleSchema,
  formatVehicleValidationError,
} from '../validators/vehicle.validator';

const vehicleService = new VehicleService();

export const createVehicle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const validationResult = createVehicleSchema.safeParse(req.body);

    if (!validationResult.success) {
      const { message, errors } = formatVehicleValidationError(validationResult.error);
      return res.status(400).json({ success: false, message, errors });
    }

    try {
      const createdVehicle = await vehicleService.createVehicle(validationResult.data);
      return res.status(201).json(createdVehicle);
    } catch (error) {
      next(error);
    }
  }
);
