import { NextFunction, Request, Response } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import { AuthService } from '../services/auth.service';
import { formatRegisterValidationError, registerSchema } from '../validators/auth.validator';

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
}
