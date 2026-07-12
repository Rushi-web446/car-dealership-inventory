import { Vehicle } from '../models/vehicle';
import { toPlainVehicle, VehicleWithStringId } from '../utils/vehicle.mapper';
import { CreateVehicleInput, SearchVehiclesInput } from '../validators/vehicle.validator';

export class VehicleService {
  public async createVehicle(vehicleData: CreateVehicleInput): Promise<VehicleWithStringId> {
    const newVehicle = await Vehicle.create(vehicleData);
    return toPlainVehicle(newVehicle);
  }

  public async getAvailableVehicles(): Promise<VehicleWithStringId[]> {
    const vehicles = await Vehicle.find({}).select('-__v');
    return vehicles.map(toPlainVehicle);
  }

  public async searchVehicles(filters: SearchVehiclesInput): Promise<VehicleWithStringId[]> {
    const query = this.buildSearchQuery(filters);
    const vehicles = await Vehicle.find(query).select('-__v');
    return vehicles.map(toPlainVehicle);
  }

  public async updateVehicle(id: string, vehicleData: CreateVehicleInput): Promise<VehicleWithStringId | null> {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      vehicleData,
      { new: true }
    );

    if (!updatedVehicle) {
      return null;
    }

    return toPlainVehicle(updatedVehicle);
  }

  public async deleteVehicle(id: string): Promise<boolean> {
    const deletedVehicle = await Vehicle.findByIdAndDelete(id);
    return deletedVehicle !== null;
  }

  private buildSearchQuery(filters: SearchVehiclesInput): Record<string, unknown> {
    const query: Record<string, unknown> = {};

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
}
