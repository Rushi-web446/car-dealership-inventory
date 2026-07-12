import { Vehicle } from '../models/vehicle';
import {
  toPlainVehicle,
  VehicleDocumentLike,
  VehicleWithStringId,
} from '../utils/vehicle.mapper';

type InventorySuccessResult = { status: 'success'; vehicle: VehicleWithStringId };
type InventoryNotFoundResult = { status: 'not_found' };

type InventoryUpdateResult = InventorySuccessResult | InventoryNotFoundResult;
type InventoryVehicleDocument = VehicleDocumentLike & { quantity: number };
type PurchaseVehicleResult =
  | InventoryUpdateResult
  | { status: 'out_of_stock' };

type RestockVehicleResult = InventoryUpdateResult;

export class InventoryService {
  public async purchaseVehicleById(id: string): Promise<PurchaseVehicleResult> {
    const vehicle = await this.findVehicleById(id);

    if (!vehicle) {
      return { status: 'not_found' };
    }

    if (vehicle.quantity <= 0) {
      return { status: 'out_of_stock' };
    }

    return this.applyQuantityChange(id, -1);
  }

  public async restockVehicleById(
    id: string,
    quantity: number
  ): Promise<RestockVehicleResult> {
    const vehicle = await this.findVehicleById(id);

    if (!vehicle) {
      return { status: 'not_found' };
    }

    return this.applyQuantityChange(id, quantity);
  }

  private async findVehicleById(id: string): Promise<InventoryVehicleDocument | null> {
    return Vehicle.findById(id);
  }

  private async applyQuantityChange(
    id: string,
    quantityChange: number
  ): Promise<InventoryUpdateResult> {
    const updatedVehicle = await this.updateVehicleQuantity(id, quantityChange);

    if (!updatedVehicle) {
      return { status: 'not_found' };
    }

    return {
      status: 'success',
      vehicle: toPlainVehicle(updatedVehicle),
    };
  }

  private async updateVehicleQuantity(
    id: string,
    quantityChange: number
  ): Promise<VehicleDocumentLike | null> {
    return Vehicle.findByIdAndUpdate(
      id,
      { $inc: { quantity: quantityChange } },
      { new: true }
    );
  }
}
