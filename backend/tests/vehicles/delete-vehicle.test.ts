import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '../../src/app';
import { Vehicle } from '../../src/models/vehicle';
import jwt from 'jsonwebtoken';

vi.mock('../../src/models/vehicle', () => ({
  Vehicle: {
    findByIdAndDelete: vi.fn(),
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

describe('DELETE /api/vehicles/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const vehicleId = 'vehicle-id';

  it('should delete a vehicle successfully', async () => {
    // Arrange
    const adminToken = createMockToken('ADMIN');
    mockedJwtVerify.mockReturnValue({
      id: 'admin-id',
      email: 'admin@example.com',
      role: 'ADMIN',
    });
    mockedVehicle.findByIdAndDelete.mockResolvedValueOnce({ _id: vehicleId } as any);

    // Act
    await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Assert
    expect(mockedVehicle.findByIdAndDelete).toHaveBeenCalledTimes(1);
    expect(mockedVehicle.findByIdAndDelete).toHaveBeenCalledWith(vehicleId);
  });

  it('should return 404 when the vehicle does not exist', async () => {
    // Arrange
    const adminToken = createMockToken('ADMIN');
    mockedJwtVerify.mockReturnValue({
      id: 'admin-id',
      email: 'admin@example.com',
      role: 'ADMIN',
    });
    mockedVehicle.findByIdAndDelete.mockResolvedValueOnce(null);

    // Act
    const response = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Assert
    expect(response.status).toBe(404);
  });

  it('should return 401 when the user is not authenticated', async () => {
    // Arrange
    // No authorization header or token provided

    // Act
    const response = await request(app)
      .delete(`/api/vehicles/${vehicleId}`);

    // Assert
    expect(response.status).toBe(401);
  });

  it('should return 403 when a non-admin user attempts to delete a vehicle', async () => {
    // Arrange
    const userToken = createMockToken('USER');
    mockedJwtVerify.mockReturnValue({
      id: 'user-id',
      email: 'user@example.com',
      role: 'USER',
    });

    // Act
    const response = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${userToken}`);

    // Assert
    expect(response.status).toBe(403);
  });

  it('should return 200 with a success message after deletion', async () => {
    // Arrange
    const adminToken = createMockToken('ADMIN');
    mockedJwtVerify.mockReturnValue({
      id: 'admin-id',
      email: 'admin@example.com',
      role: 'ADMIN',
    });
    mockedVehicle.findByIdAndDelete.mockResolvedValueOnce({ _id: vehicleId } as any);

    // Act
    const response = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('success');
  });

  it('should remove the vehicle from the database', async () => {
    // Arrange
    const adminToken = createMockToken('ADMIN');
    mockedJwtVerify.mockReturnValue({
      id: 'admin-id',
      email: 'admin@example.com',
      role: 'ADMIN',
    });
    mockedVehicle.findByIdAndDelete.mockResolvedValueOnce({ _id: vehicleId } as any);

    // Act
    await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Assert
    expect(mockedVehicle.findByIdAndDelete).toHaveBeenCalledWith(vehicleId);
  });

  it('should not return the deleted vehicle in the response', async () => {
    // Arrange
    const adminToken = createMockToken('ADMIN');
    mockedJwtVerify.mockReturnValue({
      id: 'admin-id',
      email: 'admin@example.com',
      role: 'ADMIN',
    });
    mockedVehicle.findByIdAndDelete.mockResolvedValueOnce({ _id: vehicleId } as any);

    // Act
    const response = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Assert
    expect(response.body._id).toBeUndefined();
    expect(response.body.make).toBeUndefined();
    expect(response.body.model).toBeUndefined();
  });
});
