import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: unknown;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  return jwt.sign(payload, secret, { expiresIn: '1h' });
};
