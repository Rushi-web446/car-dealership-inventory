import { NextFunction, Request, Response } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import { AuthService } from '../services/auth.service';
import { formatRegisterValidationError, loginSchema, registerSchema } from '../validators/auth.validator';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validationResult = registerSchema.safeParse(req.body);

    if (!validationResult.success) {
      const { message, errors } = formatRegisterValidationError(validationResult.error);

      return res.status(400).json({
        success: false,
        message,
        errors,
      });
    }

    try {
      const response = await this.authService.register(validationResult.data);
      return res.status(201).json(response);
    } catch (error) {
      const err = error as Error & { statusCode?: number };

      if (err.statusCode === 409) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered',
        });
      }

      return next(error);
    }
  });

  
  public login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const firstIssue = issues[0];
      const field = firstIssue?.path[0];

      let message = 'Validation failed';

      if (issues.some((issue) => /required/i.test(issue.message) || /undefined/i.test(issue.message))) {
        message = 'Required fields are missing';
      } else if (field === 'email' || issues.some((issue) => /email/i.test(issue.message))) {
        message = 'Email format is invalid';
      }

      return res.status(400).json({
        success: false,
        message,
        errors: issues.map((issue) => issue.message),
      });
    }

    try {
      const response = await this.authService.login(validationResult.data);
      return res.status(200).json(response);
    } catch (error) {
      const err = error as Error & { statusCode?: number };

      if (err.statusCode === 401) {
        return res.status(401).json({
          success: false,
          message: err.message || 'Invalid email or password',
        });
      }

      return next(error);
    }
  });
}
