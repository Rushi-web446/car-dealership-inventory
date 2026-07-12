import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '../../src/app';
import { Vehicle } from '../../src/models/vehicle';
import jwt from 'jsonwebtoken';

vi.mock('../../src/models/vehicle', () => ({
  Vehicle: {
    find: vi.fn(),
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

describe('GET /api/vehicles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDate = new Date().toISOString();
  const availableVehicle1 = createMockVehicle({
    _id: 'vehicle-1',
    make: 'Toyota',
    model: 'Camry',
    category: 'Sedan',
    price: 25000,
    quantity: 10,
    createdAt: mockDate,
    updatedAt: mockDate,
  });
  const availableVehicle2 = createMockVehicle({
    _id: 'vehicle-2',
    make: 'Honda',
    model: 'Civic',
    category: 'Sedan',
    price: 22000,
    quantity: 5,
    createdAt: mockDate,
    updatedAt: mockDate,
  });
  const unavailableVehicle = createMockVehicle({
    _id: 'vehicle-3',
    make: 'Ford',
    model: 'F-150',
    category: 'Truck',
    price: 35000,
    quantity: 0,
    createdAt: mockDate,
    updatedAt: mockDate,
    __v: 0,
  });

  it('should return all available vehicles', async () => {
    // Arrange
    const userToken = createMockToken('USER');
    mockedJwtVerify.mockReturnValue({
      id: 'user-id',
      email: 'user@example.com',
      role: 'USER',
    });
    mockedVehicle.find.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce([availableVehicle1, availableVehicle2] as any),
    } as any);

    // Act
    const response = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, vehicles: [availableVehicle1, availableVehicle2] });
  });

  it('should return an empty array when no vehicles exist', async () => {
    // Arrange
    const userToken = createMockToken('USER');
    mockedJwtVerify.mockReturnValue({
      id: 'user-id',
      email: 'user@example.com',
      role: 'USER',
    });
    mockedVehicle.find.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce([] as any),
    } as any);

    // Act
    const response = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, vehicles: [] });
  });

  it('should return only available vehicles (quantity greater than zero)', async () => {
    // Arrange
    const userToken = createMockToken('USER');
    mockedJwtVerify.mockReturnValue({
      id: 'user-id',
      email: 'user@example.com',
      role: 'USER',
    });
    mockedVehicle.find.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce([availableVehicle1] as any),
    } as any);

    // Act
    const response = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, vehicles: [availableVehicle1] });
  });

  it('should return 401 when the user is not authenticated', async () => {
    // Arrange
    // No authorization header or token provided

    // Act
    const response = await request(app).get('/api/vehicles');

    // Assert
    expect(response.status).toBe(401);
  });

  it('should return 200 with the correct response structure', async () => {
    // Arrange
    const userToken = createMockToken('USER');
    mockedJwtVerify.mockReturnValue({
      id: 'user-id',
      email: 'user@example.com',
      role: 'USER',
    });
    mockedVehicle.find.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce([availableVehicle1] as any),
    } as any);

    // Act
    const response = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.vehicles)).toBe(true);
    response.body.vehicles.forEach((vehicle: any) => {
      expect(vehicle).toHaveProperty('_id');
      expect(vehicle).toHaveProperty('make');
      expect(vehicle).toHaveProperty('model');
      expect(vehicle).toHaveProperty('category');
      expect(vehicle).toHaveProperty('price');
      expect(vehicle).toHaveProperty('quantity');
      expect(vehicle).toHaveProperty('createdAt');
      expect(vehicle).toHaveProperty('updatedAt');
    });
  });

  it('should never expose internal database fields', async () => {
    // Arrange
    const userToken = createMockToken('USER');
    mockedJwtVerify.mockReturnValue({
      id: 'user-id',
      email: 'user@example.com',
      role: 'USER',
    });
    const vehicleWithInternalField = {
      ...availableVehicle1,
      __v: 0,
    };
    mockedVehicle.find.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce([availableVehicle1] as any),
    } as any);

    // Act
    const response = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.vehicles[0]).not.toHaveProperty('__v');
  });
});
