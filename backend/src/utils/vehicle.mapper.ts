import mongoose from 'mongoose';
import { IVehicle } from '../models/vehicle';

const { ObjectId } = mongoose.Types;

export type VehicleWithStringId = IVehicle & { _id: string };

export type VehicleDocumentLike = Partial<IVehicle> & {
  _id?: unknown;
  __v?: unknown;
  toObject?: () => unknown;
};

export const toPlainVehicle = (vehicle: VehicleDocumentLike): VehicleWithStringId => {
  const source = (vehicle.toObject ? vehicle.toObject() : vehicle) as Record<string, unknown>;
  const plainVehicle: Record<string, unknown> = {};

  for (const key in source) {
    if (typeof source[key] !== 'function' && key !== '__v') {
      plainVehicle[key] = source[key];
    }
  }

  return {
    ...(plainVehicle as Omit<VehicleWithStringId, '_id'>),
    _id: plainVehicle._id instanceof ObjectId
      ? plainVehicle._id.toString()
      : String(plainVehicle._id),
  };
};
