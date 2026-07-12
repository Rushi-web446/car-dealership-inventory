import { Vehicle, IVehicle } from '../models/vehicle';
import { CreateVehicleInput } from '../validators/vehicle.validator';

export class VehicleService {
  public async createVehicle(vehicleData: CreateVehicleInput): Promise<IVehicle> {
    const newVehicle = await Vehicle.create(vehicleData);
    return newVehicle;
  }
}
