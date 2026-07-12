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

describe('POST /api/vehicles/:id/restock', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    vi.clearAllMocks();
  });

  const vehicleId = 'vehicle-id';
  const restockPayload = { quantity: 10 };
  const mockDate = new Date().toISOString();
  const existingVehicle = {
    _id: vehicleId,
    make: 'Toyota',
    model: 'Camry',
    category: 'Sedan',
    price: 25000,
    quantity: 4,
    createdAt: mockDate,
    updatedAt: mockDate,
  };
  const restockedVehicle = {
    ...existingVehicle,
    quantity: 14,
  };

  it('should restock a vehicle successfully', async () => {
    // Arrange
    const adminToken = createMockToken('ADMIN');
    mockedVehicle.findById.mockResolvedValueOnce(createMockVehicle(existingVehicle) as any);
    mockedVehicle.findByIdAndUpdate.mockResolvedValueOnce(createMockVehicle(restockedVehicle) as any);

    // Act
    await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(restockPayload);

    // Assert
    expect(mockedVehicle.findByIdAndUpdate).toHaveBeenCalledTimes(1);
  });

  it('should increase the vehicle quantity by the requested amount', async () => {
    // Arrange
    const adminToken = createMockToken('ADMIN');
    mockedVehicle.findById.mockResolvedValueOnce(createMockVehicle(existingVehicle) as any);
    mockedVehicle.findByIdAndUpdate.mockResolvedValueOnce(createMockVehicle(restockedVehicle) as any);

    // Act
    await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(restockPayload);

    // Assert
    expect(mockedVehicle.findByIdAndUpdate).toHaveBeenCalledWith(
      vehicleId,
      { $inc: { quantity: restockPayload.quantity } },
      { new: true }
    );
  });

  it('should return 400 when the restock quantity is invalid', async () => {
    // Arrange
    const adminToken = createMockToken('ADMIN');
    const invalidRestockPayload = { quantity: 0 };

    // Act
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidRestockPayload);

    // Assert
    expect(response.status).toBe(400);
  });

  it('should return 404 when the vehicle does not exist', async () => {
    // Arrange
    const adminToken = createMockToken('ADMIN');
    mockedVehicle.findById.mockResolvedValueOnce(null);

    // Act
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(restockPayload);

    // Assert
    expect(response).toMatchObject({
      status: 404,
      body: {
        success: false,
        message: 'Vehicle not found',
      },
    });
  });

  it('should return 401 when the user is not authenticated', async () => {
    // Arrange
    // No authorization header or token provided

    // Act
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .send(restockPayload);

    // Assert
    expect(response.status).toBe(401);
  });

  it('should return 403 when a non-admin user attempts to restock a vehicle', async () => {
    // Arrange
    const userToken = createMockToken('USER');

    // Act
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(restockPayload);

    // Assert
    expect(response.status).toBe(403);
  });

  it('should return 200 with the updated vehicle details', async () => {
    // Arrange
    const adminToken = createMockToken('ADMIN');
    mockedVehicle.findById.mockResolvedValueOnce(createMockVehicle(existingVehicle) as any);
    mockedVehicle.findByIdAndUpdate.mockResolvedValueOnce(createMockVehicle(restockedVehicle) as any);

    // Act
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(restockPayload);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.vehicle).toEqual(
      expect.objectContaining({
        _id: restockedVehicle._id,
        make: restockedVehicle.make,
        model: restockedVehicle.model,
        category: restockedVehicle.category,
        price: restockedVehicle.price,
        quantity: restockedVehicle.quantity,
      })
    );
  });

  it('should preserve existing vehicle information while updating only the quantity', async () => {
    // Arrange
    const adminToken = createMockToken('ADMIN');
    mockedVehicle.findById.mockResolvedValueOnce(createMockVehicle(existingVehicle) as any);
    mockedVehicle.findByIdAndUpdate.mockResolvedValueOnce(createMockVehicle(restockedVehicle) as any);

    // Act
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(restockPayload);

    // Assert
    expect(response.body.vehicle).toEqual(
      expect.objectContaining({
        _id: existingVehicle._id,
        make: existingVehicle.make,
        model: existingVehicle.model,
        category: existingVehicle.category,
        price: existingVehicle.price,
        quantity: existingVehicle.quantity + restockPayload.quantity,
      })
    );
  });
});
