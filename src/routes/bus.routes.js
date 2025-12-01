import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createBusSchema, updateBusSchema } from '../schemas/bus.schema.js';
import {
  listBusesController,
  getBusController,
  createBusController,
  updateBusController,
  deleteBusController
} from '../controllers/bus.controller.js';

const router = Router();

// ✅ IMPORTANT: Allow drivers to view buses (needed for BusSchedule)
// Get all buses - Allow admin, accountant, and driver to view
router.get('/', authenticate, authorize('admin', 'accountant', 'driver'), listBusesController);

// Get bus by ID - Allow admin, accountant, and driver to view
router.get('/:id', authenticate, authorize('admin', 'accountant', 'driver'), getBusController);

// Create bus - Admin only
router.post('/', authenticate, authorize('admin'), validate(createBusSchema), createBusController);

// Update bus (PUT) - Admin only
router.put('/:id', authenticate, authorize('admin'), validate(updateBusSchema), updateBusController);

// Delete bus - Admin only
router.delete('/:id', authenticate, authorize('admin'), deleteBusController);

export default router;
