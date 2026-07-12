import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { InventoryService } from '../services/inventory.service';
import { VehicleService } from '../services/vehicle.service';
import {
  createVehicleSchema,
  restockVehicleSchema,
  searchVehiclesSchema,
  formatVehicleValidationError,
} from '../validators/vehicle.validator';

const inventoryService = new InventoryService();
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

export const deleteVehicle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const deleted = await vehicleService.deleteVehicle(id);

      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Vehicle not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Vehicle deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

export const purchaseVehicle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const result = await inventoryService.purchaseVehicleById(id);

      if (result.status === 'not_found') {
        return res.status(404).json({ success: false, message: 'Vehicle not found' });
      }

      if (result.status === 'out_of_stock') {
        return res.status(400).json({ success: false, message: 'Vehicle is out of stock' });
      }

      return res.status(200).json({
        success: true,
        message: 'Vehicle purchased successfully',
        vehicle: result.vehicle,
        ...result.vehicle,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const restockVehicle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const validationResult = restockVehicleSchema.safeParse(req.body);

    if (!validationResult.success) {
      const { message, errors } = formatVehicleValidationError(validationResult.error);
      return res.status(400).json({ success: false, message, errors });
    }

    try {
      const id = req.params.id as string;
      const result = await inventoryService.restockVehicleById(
        id,
        validationResult.data.quantity
      );

      if (result.status === 'not_found') {
        return res.status(404).json({ success: false, message: 'Vehicle not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Vehicle restocked successfully',
        vehicle: result.vehicle,
      });
    } catch (error) {
      next(error);
    }
  }
);
