import { Router } from 'express';
import { createVehicle } from '../controllers/vehicle.controller';
import { authenticateJwt, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticateJwt, requireAdmin, createVehicle);

export default router;
