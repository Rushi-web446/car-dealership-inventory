import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { app } from '../../src/app';
import { User } from '../../src/models/user';

vi.mock('../../src/models/user', () => ({
  User: {
    findOne: vi.fn(),
  },
}));

const mockedUser = vi.mocked(User);

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should login successfully with valid credentials', async () => {
    const loginPayload = {
      email: 'rushi@gmail.com',
      password: 'Password@123',
    };

    mockedUser.findOne.mockResolvedValueOnce({
      _id: 'user-id',
      name: 'Rushi',
      email: 'rushi@gmail.com',
      role: 'USER',
      password: 'hashed-password',
    } as any);

    const response = await request(app).post('/api/auth/login').send(loginPayload);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Login successful');
  });

  it('should return 400 when required fields are missing', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'rushi@gmail.com',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/required/i);
  });

  it('should return 400 for an invalid email format', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'not-an-email',
      password: 'Password@123',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/email/i);
  });

  it('should return 401 when the email is not registered', async () => {
    mockedUser.findOne.mockResolvedValueOnce(null);

    const response = await request(app).post('/api/auth/login').send({
      email: 'unknown@gmail.com',
      password: 'Password@123',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/not registered/i);
  });

  it('should return 401 when the password is incorrect', async () => {
    mockedUser.findOne.mockResolvedValueOnce({
      _id: 'user-id',
      name: 'Rushi',
      email: 'rushi@gmail.com',
      role: 'USER',
      password: 'hashed-password',
    } as any);

    const response = await request(app).post('/api/auth/login').send({
      email: 'rushi@gmail.com',
      password: 'WrongPassword123',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/credentials/i);
  });

  it('should return a JWT token after successful login', async () => {
    mockedUser.findOne.mockResolvedValueOnce({
      _id: 'user-id',
      name: 'Rushi',
      email: 'rushi@gmail.com',
      role: 'USER',
      password: 'hashed-password',
    } as any);

    const response = await request(app).post('/api/auth/login').send({
      email: 'rushi@gmail.com',
      password: 'Password@123',
    });

    expect(response.body.token).toBeTruthy();
    expect(typeof response.body.token).toBe('string');
  });
});
