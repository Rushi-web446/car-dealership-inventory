import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Email format is invalid'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['USER', 'ADMIN']),
});

export type RegisterInput = z.infer<typeof registerSchema>;
