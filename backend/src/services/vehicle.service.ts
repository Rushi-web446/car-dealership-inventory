import { Vehicle, IVehicle } from '../models/vehicle';
import { CreateVehicleInput, SearchVehiclesInput } from '../validators/vehicle.validator';
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

export class VehicleService {
  public async createVehicle(vehicleData: CreateVehicleInput): Promise<IVehicle> {
    const newVehicle = await Vehicle.create(vehicleData);
    return newVehicle;
  }

  public async getAvailableVehicles(): Promise<(IVehicle & { _id: string })[]> {
    const vehicles = await Vehicle.find({ quantity: { $gt: 0 } }).select('-__v');
    return vehicles.map(vehicle => {
      const obj = (vehicle.toObject ? vehicle.toObject() : vehicle) as any;
      // Filter out any function properties (like toObject)
      const plainObj: any = {};
      for (const key in obj) {
        if (typeof obj[key] !== 'function') {
          plainObj[key] = obj[key];
        }
      }
      return {
        ...plainObj,
        _id: plainObj._id instanceof ObjectId ? plainObj._id.toString() : plainObj._id
      };
    }) as (IVehicle & { _id: string })[];
  }

  public async searchVehicles(filters: SearchVehiclesInput): Promise<(IVehicle & { _id: string })[]> {
    const query: any = { quantity: { $gt: 0 } };

    if (filters.make) {
      query.make = { $regex: filters.make, $options: 'i' };
    }

    if (filters.model) {
      query.model = { $regex: filters.model, $options: 'i' };
    }

    if (filters.category) {
      query.category = { $regex: filters.category, $options: 'i' };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) {
        query.price.$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        query.price.$lte = filters.maxPrice;
      }
    }

    const vehicles = await Vehicle.find(query).select('-__v');
    return vehicles.map(vehicle => {
      const obj = (vehicle.toObject ? vehicle.toObject() : vehicle) as any;
      // Filter out any function properties (like toObject)
      const plainObj: any = {};
      for (const key in obj) {
        if (typeof obj[key] !== 'function') {
          plainObj[key] = obj[key];
        }
      }
      return {
        ...plainObj,
        _id: plainObj._id instanceof ObjectId ? plainObj._id.toString() : plainObj._id
      };
    }) as (IVehicle & { _id: string })[];
  }
}
