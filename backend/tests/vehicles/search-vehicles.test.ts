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

describe('GET /api/vehicles/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDate = new Date().toISOString();
  const toyotaCamry = createMockVehicle({
    _id: 'vehicle-1',
    make: 'Toyota',
    model: 'Camry',
    category: 'Sedan',
    price: 25000,
    quantity: 10,
    createdAt: mockDate,
    updatedAt: mockDate,
  });
  const hondaCivic = createMockVehicle({
    _id: 'vehicle-2',
    make: 'Honda',
    model: 'Civic',
    category: 'Sedan',
    price: 22000,
    quantity: 5,
    createdAt: mockDate,
    updatedAt: mockDate,
  });
  const fordF150 = createMockVehicle({
    _id: 'vehicle-3',
    make: 'Ford',
    model: 'F-150',
    category: 'Truck',
    price: 35000,
    quantity: 3,
    createdAt: mockDate,
    updatedAt: mockDate,
  });

  it('should return vehicles matching the make', async () => {
    // Arrange
    const userToken = createMockToken('USER');
    mockedJwtVerify.mockReturnValue({
      id: 'user-id',
      email: 'user@example.com',
      role: 'USER',
    });
    mockedVehicle.find.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce([toyotaCamry] as any),
    } as any);

    // Act
    const response = await request(app)
      .get('/api/vehicles/search')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ make: 'Toyota' });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.vehicles).toEqual([toyotaCamry]);
  });

  it('should return vehicles matching the model', async () => {
    // Arrange
    const userToken = createMockToken('USER');
    mockedJwtVerify.mockReturnValue({
      id: 'user-id',
      email: 'user@example.com',
      role: 'USER',
    });
    mockedVehicle.find.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce([hondaCivic] as any),
    } as any);

    // Act
    const response = await request(app)
      .get('/api/vehicles/search')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ model: 'Civic' });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.vehicles).toEqual([hondaCivic]);
  });

  it('should return vehicles matching the category', async () => {
    // Arrange
    const userToken = createMockToken('USER');
    mockedJwtVerify.mockReturnValue({
      id: 'user-id',
      email: 'user@example.com',
      role: 'USER',
    });
    mockedVehicle.find.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce([toyotaCamry, hondaCivic] as any),
    } as any);

    // Act
    const response = await request(app)
      .get('/api/vehicles/search')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ category: 'Sedan' });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.vehicles).toEqual([toyotaCamry, hondaCivic]);
  });

  it('should return vehicles within the specified price range', async () => {
    // Arrange
    const userToken = createMockToken('USER');
    mockedJwtVerify.mockReturnValue({
      id: 'user-id',
      email: 'user@example.com',
      role: 'USER',
    });
    mockedVehicle.find.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce([toyotaCamry, hondaCivic] as any),
    } as any);

    // Act
    const response = await request(app)
      .get('/api/vehicles/search')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ minPrice: 20000, maxPrice: 30000 });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.vehicles).toEqual([toyotaCamry, hondaCivic]);
  });

  it('should return an empty array when no vehicles match', async () => {
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
      .get('/api/vehicles/search')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ make: 'NonExistentBrand' });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.vehicles).toEqual([]);
  });

  it('should return 400 when the price range is invalid', async () => {
    // Arrange
    const userToken = createMockToken('USER');
    mockedJwtVerify.mockReturnValue({
      id: 'user-id',
      email: 'user@example.com',
      role: 'USER',
    });

    // Act
    const response = await request(app)
      .get('/api/vehicles/search')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ minPrice: 30000, maxPrice: 20000 });

    // Assert
    expect(response.status).toBe(400);
  });

  it('should return 401 when the user is not authenticated', async () => {
    // Arrange
    // No authorization header or token provided

    // Act
    const response = await request(app).get('/api/vehicles/search');

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
      select: vi.fn().mockResolvedValueOnce([toyotaCamry] as any),
    } as any);

    // Act
    const response = await request(app)
      .get('/api/vehicles/search')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ make: 'Toyota' });

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
});
