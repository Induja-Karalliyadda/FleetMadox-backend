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

// Get all buses
router.get('/', authenticate, authorize('admin'), listBusesController);

// Get bus by ID
router.get('/:id', authenticate, authorize('admin'), getBusController);

// Create bus
router.post('/', authenticate, authorize('admin'), validate(createBusSchema), createBusController);

// ✅ Update bus (PUT)
router.put('/:id', authenticate, authorize('admin'), validate(updateBusSchema), updateBusController);


// Delete bus
router.delete('/:id', authenticate, authorize('admin'), deleteBusController);

export default router;
