import { Vehicle } from '../models/vehicle';
import {
  toPlainVehicle,
  VehicleDocumentLike,
  VehicleWithStringId,
} from '../utils/vehicle.mapper';

type PurchaseVehicleResult =
  | { status: 'success'; vehicle: VehicleWithStringId }
  | { status: 'not_found' }
  | { status: 'out_of_stock' };

export class InventoryService {
  public async purchaseVehicleById(id: string): Promise<PurchaseVehicleResult> {
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return { status: 'not_found' };
    }

    if (vehicle.quantity <= 0) {
      return { status: 'out_of_stock' };
    }

    const updatedVehicle = await this.decrementVehicleQuantity(id);

    if (!updatedVehicle) {
      return { status: 'not_found' };
    }

    return {
      status: 'success',
      vehicle: toPlainVehicle(updatedVehicle),
    };
  }

  private async decrementVehicleQuantity(id: string): Promise<VehicleDocumentLike | null> {
    return Vehicle.findByIdAndUpdate(
      id,
      { $inc: { quantity: -1 } },
      { new: true }
    );
  }
}
