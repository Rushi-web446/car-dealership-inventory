import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '../../src/app';
import { Vehicle } from '../../src/models/vehicle';
import jwt from 'jsonwebtoken';

vi.mock('../../src/models/vehicle', () => ({
  Vehicle: {
    create: vi.fn(),
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

describe('POST /api/vehicles', () => {
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

  it('should create a new vehicle successfully', async () => {
    // Arrange
    const adminToken = createMockToken('ADMIN');
    mockedJwtVerify.mockReturnValue({
      id: 'admin-id',
      email: 'admin@example.com',
      role: 'ADMIN',
    });
    mockedVehicle.create.mockResolvedValueOnce({
      _id: 'vehicle-id',
      ...validVehiclePayload,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    // Act
    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validVehiclePayload);

    // Assert
    expect(mockedVehicle.create).toHaveBeenCalledTimes(1);
  });

  it('should return 400 when required fields are missing', async () => {
    // Arrange
    const adminToken = createMockToken('ADMIN');
    mockedJwtVerify.mockReturnValue({
      id: 'admin-id',
      email: 'admin@example.com',
      role: 'ADMIN',
    });
    const missingFieldsPayload = {
      make: 'Toyota',
    };

    // Act
    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(missingFieldsPayload);

    // Assert
    expect(response.status).toBe(400);
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
      .post('/api/vehicles')
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
      .post('/api/vehicles')
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
      .post('/api/vehicles')
      .send(validVehiclePayload);

    // Assert
    expect(response.status).toBe(401);
  });

  it('should return 403 when a non-admin user tries to create a vehicle', async () => {
    // Arrange
    const userToken = createMockToken('USER');
    mockedJwtVerify.mockReturnValue({
      id: 'user-id',
      email: 'user@example.com',
      role: 'USER',
    });

    // Act
    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validVehiclePayload);

    // Assert
    expect(response.status).toBe(403);
  });

  it('should return 201 with the created vehicle details', async () => {
    // Arrange
    const adminToken = createMockToken('ADMIN');
    const expectedVehicle = {
      _id: 'vehicle-id',
      ...validVehiclePayload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockedJwtVerify.mockReturnValue({
      id: 'admin-id',
      email: 'admin@example.com',
      role: 'ADMIN',
    });
    mockedVehicle.create.mockResolvedValueOnce(expectedVehicle as any);

    // Act
    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validVehiclePayload);

    // Assert
    expect(response.status).toBe(201);
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
