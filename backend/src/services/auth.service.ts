import { User } from '../models/user';
import { comparePassword, hashPassword } from '../utils/hash';
import { generateAccessToken } from '../utils/jwt';
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

interface UserWithSummaryFields {
  _id: unknown;
  name: string;
  email: string;
  role: string;
}

export class AuthService {
  public async register(registerData: RegisterInput): Promise<RegistrationResponse> {
    await this.checkEmailAvailability(registerData.email);

    const hashedPassword = await hashPassword(registerData.password);
    const createdUser = await User.create({
      name: registerData.name,
      email: registerData.email,
      password: hashedPassword,
      role: registerData.role,
    });

    return {
      success: true,
      message: 'User registered successfully',
      user: this.createUserSummary(createdUser),
    };
  }

  public async login(loginData: LoginInput): Promise<LoginResponse> {
    const existingUser = await User.findOne({ email: loginData.email });

    if (!existingUser) {
      const error = new Error('Email not registered');
      (error as Error & { statusCode?: number }).statusCode = 401;
      throw error;
    }

    const isPasswordValid = await comparePassword(loginData.password, existingUser.password);

    if (!isPasswordValid) {
      const error = new Error('Invalid credentials');
      (error as Error & { statusCode?: number }).statusCode = 401;
      throw error;
    }

    const token = generateAccessToken({
      id: existingUser._id,
      email: existingUser.email,
      role: existingUser.role,
    });

    return {
      success: true,
      message: 'Login successful',
      token,
      user: this.createUserSummary(existingUser),
    };
  }

  private async checkEmailAvailability(email: string): Promise<void> {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error('Email already registered');
      (error as Error & { statusCode?: number }).statusCode = 409;
      throw error;
    }
  }

  private createUserSummary(user: UserWithSummaryFields): UserSummary {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
