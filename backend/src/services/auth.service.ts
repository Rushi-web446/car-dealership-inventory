import bcrypt from 'bcrypt';
import { User } from '../models/user';
import { RegisterInput } from '../validators/auth.validator';

export class AuthService {
  public async register(data: RegisterInput) {
    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      const error = new Error('Email already registered');
      (error as Error & { statusCode?: number }).statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    });

    return {
      success: true,
      message: 'User registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
