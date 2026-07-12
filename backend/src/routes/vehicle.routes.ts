import { Router } from 'express';
import { createVehicle, getVehicles } from '../controllers/vehicle.controller';
import { authenticateJwt, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticateJwt, requireAdmin, createVehicle);
router.get('/', authenticateJwt, getVehicles);

export default router;
