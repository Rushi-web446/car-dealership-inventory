import jwt from 'jsonwebtoken';

import { User } from '../models/user';
import { comparePassword, hashPassword } from '../utils/hash';
import { LoginInput, RegisterInput } from '../validators/auth.validator';

interface UserSummary {
  _id: unknown;
  name: string;
  email: string;
  role: string;
}

interface RegistrationResponse {
  success: true;
  message: string;
  user: UserSummary;
}

interface LoginResponse {
  success: true;
  message: string;
  token: string;
  user: UserSummary;
}

export class AuthService {
  public async register(data: RegisterInput): Promise<RegistrationResponse> {
    await this.ensureEmailIsAvailable(data.email);

    const hashedPassword = await hashPassword(data.password);
    const createdUser = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    });

    return this.buildRegistrationResponse(createdUser);
  }

  public async login(data: LoginInput): Promise<LoginResponse> {
    const existingUser = await User.findOne({ email: data.email });

    if (!existingUser) {
      const error = new Error('Email not registered');
      (error as Error & { statusCode?: number }).statusCode = 401;
      throw error;
    }

    const isPasswordValid = await comparePassword(data.password, existingUser.password);

    if (!isPasswordValid) {
      const error = new Error('Invalid credentials');
      (error as Error & { statusCode?: number }).statusCode = 401;
      throw error;
    }

    const token = this.generateToken(existingUser);

    return {
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      },
    };
  }

  private async ensureEmailIsAvailable(email: string): Promise<void> {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error('Email already registered');
      (error as Error & { statusCode?: number }).statusCode = 409;
      throw error;
    }
  }

  private buildRegistrationResponse(createdUser: { _id: unknown; name: string; email: string; role: string }): RegistrationResponse {
    return {
      success: true,
      message: 'User registered successfully',
      user: {
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      },
    };
  }

  private generateToken(user: { _id: unknown; email: string; role: string }): string {
    const secret = process.env.JWT_SECRET || 'default-secret';

    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn: '1h' }
    );
  }
}
