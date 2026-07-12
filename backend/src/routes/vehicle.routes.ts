import { Router } from 'express';
import { createVehicle, getVehicles, searchVehicles, updateVehicle } from '../controllers/vehicle.controller';
import { authenticateJwt, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticateJwt, requireAdmin, createVehicle);
router.get('/', authenticateJwt, getVehicles);
router.get('/search', authenticateJwt, searchVehicles);
router.put('/:id', authenticateJwt, requireAdmin, updateVehicle);

export default router;
