import mongoose from 'mongoose';
import { Vehicle, IVehicle } from '../models/vehicle';
import { CreateVehicleInput, SearchVehiclesInput } from '../validators/vehicle.validator';

const { ObjectId } = mongoose.Types;

type VehicleWithStringId = IVehicle & { _id: string };

export class VehicleService {
  public async createVehicle(vehicleData: CreateVehicleInput): Promise<VehicleWithStringId> {
    const newVehicle = await Vehicle.create(vehicleData);
    return this.convertToPlainObject(newVehicle);
  }

  public async getAvailableVehicles(): Promise<VehicleWithStringId[]> {
    const vehicles = await Vehicle.find({ quantity: { $gt: 0 } }).select('-__v');
    return vehicles.map(this.convertToPlainObject);
  }

  public async searchVehicles(filters: SearchVehiclesInput): Promise<VehicleWithStringId[]> {
    const query = this.buildSearchQuery(filters);
    const vehicles = await Vehicle.find(query).select('-__v');
    return vehicles.map(this.convertToPlainObject);
  }

  public async updateVehicle(id: string, vehicleData: CreateVehicleInput): Promise<VehicleWithStringId | null> {
    let updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      vehicleData,
      { new: true }
    );

    if (!updatedVehicle) {
      return null;
    }

    // Manually exclude __v since findByIdAndUpdate doesn't support .select() as nicely as find()
    const convertedVehicle = this.convertToPlainObject(updatedVehicle);
    return convertedVehicle;
  }

  public async deleteVehicle(id: string): Promise<boolean> {
    const deletedVehicle = await Vehicle.findByIdAndDelete(id);
    return deletedVehicle !== null;
  }

  private buildSearchQuery(filters: SearchVehiclesInput): Record<string, unknown> {
    const query: Record<string, unknown> = { quantity: { $gt: 0 } };

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
      const priceFilter: Record<string, unknown> = {};
      if (filters.minPrice !== undefined) {
        priceFilter.$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        priceFilter.$lte = filters.maxPrice;
      }
      query.price = priceFilter;
    }

    return query;
  }

  private convertToPlainObject(vehicle: any): VehicleWithStringId {
    const obj = (vehicle.toObject ? vehicle.toObject() : vehicle) as any;
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
  }
}
