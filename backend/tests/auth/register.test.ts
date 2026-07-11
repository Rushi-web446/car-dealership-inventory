import request from 'supertest';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { app } from '../../src/app';
import { User } from '../../src/models/user';

vi.mock('../../src/models/user', () => ({
  User: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

const mockedUser = vi.mocked(User);

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    const payload = {
      name: 'Rushi',
      email: 'rushi@gmail.com',
      password: 'Password@123',
      role: 'USER',
    };

    mockedUser.findOne.mockResolvedValueOnce(null);
    mockedUser.create.mockResolvedValueOnce({
      _id: 'user-id',
      name: payload.name,
      email: payload.email,
      role: payload.role,
      password: 'hashed-password',
    } as any);

    const response = await request(app).post('/api/auth/register').send(payload);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully');
    expect(response.body.user.email).toBe(payload.email);
  });

  it('should return 400 when required fields are missing', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Rushi',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/required/i);
  });

  it('should return 400 for an invalid email format', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Rushi',
      email: 'not-an-email',
      password: 'Password@123',
      role: 'USER',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/email/i);
  });

  it('should return 400 for an invalid role', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Rushi',
      email: 'rushi@gmail.com',
      password: 'Password@123',
      role: 'MANAGER',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/role/i);
  });

  it('should return 409 if the email is already registered', async () => {
    mockedUser.findOne.mockResolvedValueOnce({ email: 'rushi@gmail.com' } as any);

    const response = await request(app).post('/api/auth/register').send({
      name: 'Rushi',
      email: 'rushi@gmail.com',
      password: 'Password@123',
      role: 'USER',
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/already/i);
  });

  it('should store a hashed password instead of the raw password', async () => {
    mockedUser.findOne.mockResolvedValueOnce(null);
    mockedUser.create.mockResolvedValueOnce({
      _id: 'user-id',
      name: 'Rushi',
      email: 'rushi@gmail.com',
      role: 'USER',
      password: 'hashed-password',
    } as any);

    await request(app).post('/api/auth/register').send({
      name: 'Rushi',
      email: 'rushi@gmail.com',
      password: 'Password@123',
      role: 'USER',
    });

    const createdUserPayload = mockedUser.create.mock.calls[0][0] as { password: string };
    expect(createdUserPayload.password).not.toBe('Password@123');
    expect(createdUserPayload.password).toBeTruthy();
  });

  it('should not return the password in the response', async () => {
    mockedUser.findOne.mockResolvedValueOnce(null);
    mockedUser.create.mockResolvedValueOnce({
      _id: 'user-id',
      name: 'Rushi',
      email: 'rushi@gmail.com',
      role: 'USER',
      password: 'hashed-password',
    } as any);

    const response = await request(app).post('/api/auth/register').send({
      name: 'Rushi',
      email: 'rushi@gmail.com',
      password: 'Password@123',
      role: 'USER',
    });

    expect(response.body.user.password).toBeUndefined();
  });
});
