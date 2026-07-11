import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema } from '../validators/auth.validator';
import { asyncHandler } from '../utils/asyncHandler';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = registerSchema.safeParse(req.body);
    console.log("\n\n\n &&&&&&&&&&&&&&&&&&&& \n\n\n");
    if (!result.success) {
      const issues = result.error.issues;
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

      return res.status(400).json({
        success: false,
        message,
        errors: issues.map((issue) => issue.message),
      });
    }

    try {
      const response = await this.authService.register(result.data);
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
