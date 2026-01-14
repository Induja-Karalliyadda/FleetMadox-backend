// Bus Routes
// File: routes/bus.routes.js

import express from 'express';
import {
  listBusesController,
  getBusController,
  createBusController,
  updateBusController,
  deleteBusController
} from '../controllers/bus.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// ==========================================
// BUS ROUTES
// ==========================================

// Get all buses (Admin/Accountant)
router.get('/',
  authenticate,
  authorize('admin', 'accountant'),
  listBusesController
);

// Get bus by ID
router.get('/:id',
  authenticate,
  getBusController
);

// Create a new bus (Admin only)
router.post('/',
  authenticate,
  authorize('admin'),
  createBusController
);

// Update a bus (Admin only)
router.put('/:id',
  authenticate,
  authorize('admin'),
  updateBusController
);

// Delete a bus (Admin only)
router.delete('/:id',
  authenticate,
  authorize('admin'),
  deleteBusController
);

export default router;