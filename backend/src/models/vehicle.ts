import { Model, model, Schema } from 'mongoose';

export interface IVehicle {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    make: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Vehicle: Model<IVehicle> = model<IVehicle>('Vehicle', vehicleSchema);
