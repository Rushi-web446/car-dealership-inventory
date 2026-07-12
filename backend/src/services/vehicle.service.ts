import { Vehicle, IVehicle } from '../models/vehicle';
import { CreateVehicleInput } from '../validators/vehicle.validator';

export class VehicleService {
  public async createVehicle(vehicleData: CreateVehicleInput): Promise<IVehicle> {
    const newVehicle = await Vehicle.create(vehicleData);
    return newVehicle;
  }

  public async getAvailableVehicles(): Promise<(IVehicle & { _id: string })[]> {
    const vehicles = await Vehicle.find({ quantity: { $gt: 0 } }).select('-__v');
    return vehicles as (IVehicle & { _id: string })[];
  }
}
