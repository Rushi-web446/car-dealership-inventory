import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';

const router = Router();
const authController = new AuthController(new AuthService());

router.post('/register', authController.register);

export default router;
