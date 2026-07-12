import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app';
import { Vehicle } from '../../src/models/vehicle';

vi.mock('../../src/models/vehicle', () => ({
  Vehicle: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

const mockedVehicle = vi.mocked(Vehicle);

const createMockToken = (role: 'USER' | 'ADMIN') => {
  return jwt.sign(
    {
      id: `${role.toLowerCase()}-id`,
      email: `${role.toLowerCase()}@example.com`,
      role,
    },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

const createMockVehicle = (vehicle: any) => {
  const mockVehicle = { ...vehicle };
  Object.defineProperty(mockVehicle, 'toObject', {
    value: () => vehicle,
    enumerable: false,
    writable: true,
    configurable: true,
  });
  return mockVehicle;
};

describe('POST /api/vehicles/:id/purchase', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    vi.clearAllMocks();
  });

  const vehicleId = 'vehicle-id';
  const mockDate = new Date().toISOString();
  const availableVehicle = {
    _id: vehicleId,
    make: 'Toyota',
    model: 'Camry',
    category: 'Sedan',
    price: 25000,
    quantity: 2,
    createdAt: mockDate,
    updatedAt: mockDate,
  };
  const purchasedVehicle = {
    ...availableVehicle,
    quantity: 1,
  };

  it('should purchase a vehicle successfully', async () => {
    // Arrange
    const userToken = createMockToken('USER');
    mockedVehicle.findById.mockResolvedValueOnce(createMockVehicle(availableVehicle) as any);
    mockedVehicle.findByIdAndUpdate.mockResolvedValueOnce(createMockVehicle(purchasedVehicle) as any);

    // Act
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    // Assert
    expect(response.status).toBe(200);
  });

  it('should decrease the vehicle quantity by one', async () => {
    // Arrange
    const userToken = createMockToken('USER');
    mockedVehicle.findById.mockResolvedValueOnce(createMockVehicle(availableVehicle) as any);
    mockedVehicle.findByIdAndUpdate.mockResolvedValueOnce(createMockVehicle(purchasedVehicle) as any);

    // Act
    await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    // Assert
    expect(mockedVehicle.findByIdAndUpdate).toHaveBeenCalledWith(
      vehicleId,
      { $inc: { quantity: -1 } },
      { new: true }
    );
  });

  it('should return 404 when the vehicle does not exist', async () => {
    // Arrange
    const userToken = createMockToken('USER');
    mockedVehicle.findById.mockResolvedValueOnce(null);

    // Act
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    // Assert
    expect(response).toMatchObject({
      status: 404,
      body: {
        success: false,
        message: 'Vehicle not found',
      },
    });
  });

  it('should return 400 when the vehicle is out of stock', async () => {
    // Arrange
    const userToken = createMockToken('USER');
    const outOfStockVehicle = {
      ...availableVehicle,
      quantity: 0,
    };
    mockedVehicle.findById.mockResolvedValueOnce(createMockVehicle(outOfStockVehicle) as any);

    // Act
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    // Assert
    expect(response.status).toBe(400);
  });

  it('should return 401 when the user is not authenticated', async () => {
    // Arrange
    // No authorization header or token provided

    // Act
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`);

    // Assert
    expect(response.status).toBe(401);
  });

  it('should return 200 with the updated vehicle details', async () => {
    // Arrange
    const userToken = createMockToken('USER');
    mockedVehicle.findById.mockResolvedValueOnce(createMockVehicle(availableVehicle) as any);
    mockedVehicle.findByIdAndUpdate.mockResolvedValueOnce(createMockVehicle(purchasedVehicle) as any);

    // Act
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        _id: purchasedVehicle._id,
        make: purchasedVehicle.make,
        model: purchasedVehicle.model,
        category: purchasedVehicle.category,
        price: purchasedVehicle.price,
        quantity: purchasedVehicle.quantity,
      })
    );
  });

  it('should never reduce the quantity below zero', async () => {
    // Arrange
    const userToken = createMockToken('USER');
    const lastVehicleInStock = {
      ...availableVehicle,
      quantity: 1,
    };
    const purchasedLastVehicle = {
      ...availableVehicle,
      quantity: 0,
    };
    mockedVehicle.findById.mockResolvedValueOnce(createMockVehicle(lastVehicleInStock) as any);
    mockedVehicle.findByIdAndUpdate.mockResolvedValueOnce(createMockVehicle(purchasedLastVehicle) as any);

    // Act
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    // Assert
    expect(response.body.quantity).toBe(0);
  });
});
