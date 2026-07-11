import { User } from '../models/user';
import { hashPassword } from '../utils/hash';
import { RegisterInput } from '../validators/auth.validator';

interface RegistrationResponse {
  success: true;
  message: string;
  user: {
    _id: unknown;
    name: string;
    email: string;
    role: string;
  };
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
}
