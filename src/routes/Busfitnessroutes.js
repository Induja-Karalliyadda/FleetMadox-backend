// Bus Fitness API Routes
// File: routes/Busfitnessroutes.js

import express from 'express';
import * as busFitnessController from '../controllers/Busfitnesscontroller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// ==========================================
// BUS FITNESS ROUTES
// ==========================================

// Get all fitness records (Admin/Accountant)
router.get('/',
  authenticate,
  authorize('admin', 'accountant'),
  busFitnessController.getAllFitnessRecords
);

// Get fitness records by date
router.get('/date/:date',
  authenticate,
  busFitnessController.getFitnessRecordsByDate
);

// Get fitness records for a specific bus
router.get('/bus/:busId',
  authenticate,
  busFitnessController.getFitnessRecordsByBus
);

// Get fitness records for a specific bus with driver details
router.get('/bus/:busId/history',
  authenticate,
  busFitnessController.getBusHistoryWithDrivers
);

// Get bus check status for a specific date
router.get('/status/:date',
  authenticate,
  busFitnessController.getBusCheckStatus
);

// Get today's assignments with check status
router.get('/today-assignments',
  authenticate,
  busFitnessController.getTodayAssignmentsWithStatus
);

// Get fitness summary statistics (must be before /:id to avoid conflict)
router.get('/stats/summary',
  authenticate,
  authorize('admin', 'accountant'),
  busFitnessController.getFitnessSummary
);

// Get fitness record by ID
router.get('/:id',
  authenticate,
  busFitnessController.getFitnessRecordById
);

// Create a new fitness check (Driver only)
router.post('/',
  authenticate,
  authorize('driver'),
  busFitnessController.createFitnessRecord
);

// Update a fitness record
router.put('/:id',
  authenticate,
  busFitnessController.updateFitnessRecord
);

// Delete a fitness record (Admin only)
router.delete('/:id',
  authenticate,
  authorize('admin'),
  busFitnessController.deleteFitnessRecord
);

export default router;