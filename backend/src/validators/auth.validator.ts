import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Email format is invalid'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['USER', 'ADMIN']),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Email format is invalid'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const formatRegisterValidationError = (error: z.ZodError) => {
  const issues = error.issues;
  const firstIssue = issues[0];
  const field = firstIssue?.path[0];

  let message = 'Validation failed';

  if (issues.some((issue) => /required/i.test(issue.message) || /undefined/i.test(issue.message))) {
    message = 'Required fields are missing';
  } else if (field === 'email' || issues.some((issue) => /email/i.test(issue.message))) {
    message = 'Email format is invalid';
  } else if (field === 'role' || issues.some((issue) => /role/i.test(issue.message))) {
    message = 'Role must be USER or ADMIN';
  }

  return {
    message,
    errors: issues.map((issue) => issue.message),
  };
};
