import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { VehicleService } from '../services/vehicle.service';
import {
  createVehicleSchema,
  searchVehiclesSchema,
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

export const getVehicles = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const availableVehicles = await vehicleService.getAvailableVehicles();
      return res.status(200).json({ success: true, vehicles: availableVehicles });
    } catch (error) {
      next(error);
    }
  }
);

export const searchVehicles = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const validationResult = searchVehiclesSchema.safeParse(req.query);

    if (!validationResult.success) {
      const { message, errors } = formatVehicleValidationError(validationResult.error);
      return res.status(400).json({ success: false, message, errors });
    }

    try {
      const vehicles = await vehicleService.searchVehicles(validationResult.data);
      return res.status(200).json({ success: true, vehicles });
    } catch (error) {
      next(error);
    }
  }
);

export const updateVehicle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const validationResult = createVehicleSchema.safeParse(req.body);

    if (!validationResult.success) {
      const { message, errors } = formatVehicleValidationError(validationResult.error);
      return res.status(400).json({ success: false, message, errors });
    }

    try {
      const id = req.params.id as string;
      const updatedVehicle = await vehicleService.updateVehicle(
        id,
        validationResult.data
      );

      if (!updatedVehicle) {
        return res.status(404).json({ success: false, message: 'Vehicle not found' });
      }

      return res.status(200).json(updatedVehicle);
    } catch (error) {
      next(error);
    }
  }
);
