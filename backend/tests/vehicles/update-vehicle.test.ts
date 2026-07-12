import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '../../src/app';
import { Vehicle } from '../../src/models/vehicle';
import jwt from 'jsonwebtoken';

vi.mock('../../src/models/vehicle', () => ({
  Vehicle: {
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => {
  return {
    __esModule: true,
    default: {
      verify: vi.fn(),
    },
  };
});

const mockedVehicle = vi.mocked(Vehicle);
const mockedJwt = vi.mocked(jwt);
const mockedJwtVerify = mockedJwt.verify as ReturnType<typeof vi.fn>;

const createMockToken = (role: 'USER' | 'ADMIN') => {
  return 'mock-token';
};

const createMockVehicle = (vehicle: any) => {
  const mockVehicle = { ...vehicle };
  Object.defineProperty(mockVehicle, 'toObject', {
    value: () => vehicle,
    enumerable: false,
    writable: true,
    configurable: true
  });
  return mockVehicle;
};

describe('PUT /api/vehicles/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validVehiclePayload = {
    make: 'Toyota',
    model: 'Camry',
    category: 'Sedan',
    price: 25000,
    quantity: 10,
  };

  const vehicleId = 'vehicle-id';

  it('should update a vehicle successfully', async () => {
    // Arrange
    const adminToken = createMockToken('ADMIN');
    mockedJwtVerify.mockReturnValue({
      id: 'admin-id',
      email: 'admin@example.com',
      role: 'ADMIN',
    });
    const updatedVehicle = {
      _id: vehicleId,
      ...validVehiclePayload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockedVehicle.findByIdAndUpdate.mockResolvedValueOnce(createMockVehicle(updatedVehicle) as any);

    // Act
    const response = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validVehiclePayload);

    // Assert
    expect(mockedVehicle.findByIdAndUpdate).toHaveBeenCalledTimes(1);
  });

  it('should return 400 when the request body is invalid', async () => {
    // Arrange
    const adminToken = createMockToken('ADMIN');
    mockedJwtVerify.mockReturnValue({
      id: 'admin-id',
      email: 'admin@example.com',
      role: 'ADMIN',
    });
    const invalidPayload = {
      make: 'Toyota',
    };

    // Act
    const response = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidPayload);

    // Assert
    expect(response.status).toBe(400);
  });

  it('should return 404 when the vehicle does not exist', async () => {
    // Arrange
    const adminToken = createMockToken('ADMIN');
    mockedJwtVerify.mockReturnValue({
      id: 'admin-id',
      email: 'admin@example.com',
      role: 'ADMIN',
    });
    mockedVehicle.findByIdAndUpdate.mockResolvedValueOnce(null);

    // Act
    const response = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validVehiclePayload);

    // Assert
    expect(response.status).toBe(404);
  });

  it('should return 400 when price is negative', async () => {
    // Arrange
    const adminToken = createMockToken('ADMIN');
    mockedJwtVerify.mockReturnValue({
      id: 'admin-id',
      email: 'admin@example.com',
      role: 'ADMIN',
    });
    const negativePricePayload = {
      ...validVehiclePayload,
      price: -100,
    };

    // Act
    const response = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(negativePricePayload);

    // Assert
    expect(response.status).toBe(400);
  });

  it('should return 400 when quantity is negative', async () => {
    // Arrange
    const adminToken = createMockToken('ADMIN');
    mockedJwtVerify.mockReturnValue({
      id: 'admin-id',
      email: 'admin@example.com',
      role: 'ADMIN',
    });
    const negativeQuantityPayload = {
      ...validVehiclePayload,
      quantity: -5,
    };

    // Act
    const response = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(negativeQuantityPayload);

    // Assert
    expect(response.status).toBe(400);
  });

  it('should return 401 when the user is not authenticated', async () => {
    // Arrange
    // No authorization header or token provided

    // Act
    const response = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .send(validVehiclePayload);

    // Assert
    expect(response.status).toBe(401);
  });

  it('should return 403 when a non-admin user attempts to update a vehicle', async () => {
    // Arrange
    const userToken = createMockToken('USER');
    mockedJwtVerify.mockReturnValue({
      id: 'user-id',
      email: 'user@example.com',
      role: 'USER',
    });

    // Act
    const response = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(validVehiclePayload);

    // Assert
    expect(response.status).toBe(403);
  });

  it('should return the updated vehicle in the response', async () => {
    // Arrange
    const adminToken = createMockToken('ADMIN');
    const expectedVehicle = {
      _id: vehicleId,
      ...validVehiclePayload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockedJwtVerify.mockReturnValue({
      id: 'admin-id',
      email: 'admin@example.com',
      role: 'ADMIN',
    });
    mockedVehicle.findByIdAndUpdate.mockResolvedValueOnce(createMockVehicle(expectedVehicle) as any);

    // Act
    const response = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validVehiclePayload);

    // Assert
    expect(response.body).toEqual(
      expect.objectContaining({
        _id: expectedVehicle._id,
        make: expectedVehicle.make,
        model: expectedVehicle.model,
        category: expectedVehicle.category,
        price: expectedVehicle.price,
        quantity: expectedVehicle.quantity,
      })
    );
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.updatedAt).toBeDefined();
  });
});
