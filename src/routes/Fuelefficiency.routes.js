/**
 * Fuel Efficiency Routes
 * API endpoints for fuel efficiency reports
 * File: routes/Fuelefficiency.routes.js
 */

import express from 'express';
import * as fuelEfficiencyController from '../controllers/Fuelefficiency.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// ==================== Bus Efficiency Routes ====================

/**
 * GET /api/fuel-efficiency/buses
 * Get all buses with efficiency rankings
 * Query params: range (week|month|quarter|year|all)
 */
router.get('/buses', 
  authenticate, 
  authorize('admin', 'accountant'), 
  fuelEfficiencyController.getBusEfficiency
);

/**
 * GET /api/fuel-efficiency/bus/:busId/full-report
 * Get full bus report with drivers and fuel entries
 * Query params: range (week|month|quarter|year|all)
 */
router.get('/bus/:busId/full-report', 
  authenticate, 
  authorize('admin', 'accountant'), 
  fuelEfficiencyController.getBusFullReport
);

/**
 * GET /api/fuel-efficiency/buses/:busId
 * Get single bus efficiency by ID
 * Query params: range (week|month|quarter|year|all)
 */
router.get('/buses/:busId', 
  authenticate, 
  authorize('admin', 'accountant'), 
  fuelEfficiencyController.getBusEfficiencyById
);

// ==================== Driver Efficiency Routes ====================

/**
 * GET /api/fuel-efficiency/drivers
 * Get all drivers with efficiency rankings
 * Query params: range (week|month|quarter|year|all)
 */
router.get('/drivers', 
  authenticate, 
  authorize('admin', 'accountant'), 
  fuelEfficiencyController.getDriverEfficiency
);

/**
 * GET /api/fuel-efficiency/driver/:driverId/full-report
 * Get full driver report with buses and fuel entries
 * Query params: range (week|month|quarter|year|all)
 */
router.get('/driver/:driverId/full-report', 
  authenticate, 
  authorize('admin', 'accountant', 'driver'), 
  fuelEfficiencyController.getDriverFullReport
);

/**
 * GET /api/fuel-efficiency/driver/:driverId/buses-operated
 * Get buses operated by a driver
 * Query params: range (week|month|quarter|year|all)
 */
router.get('/driver/:driverId/buses-operated', 
  authenticate, 
  authorize('admin', 'accountant', 'driver'), 
  fuelEfficiencyController.getDriverBusesOperated
);

/**
 * GET /api/fuel-efficiency/driver/:driverId/fuel-entries
 * Get fuel entries for a driver
 * Query params: range (week|month|quarter|year|all)
 */
router.get('/driver/:driverId/fuel-entries', 
  authenticate, 
  authorize('admin', 'accountant', 'driver'), 
  fuelEfficiencyController.getDriverFuelEntries
);

/**
 * GET /api/fuel-efficiency/drivers/:driverId
 * Get single driver efficiency by ID
 * Query params: range (week|month|quarter|year|all)
 */
router.get('/drivers/:driverId', 
  authenticate, 
  authorize('admin', 'accountant', 'driver'), 
  fuelEfficiencyController.getDriverEfficiencyById
);

// ==================== Leaderboard Routes ====================

/**
 * GET /api/fuel-efficiency/leaderboard
 * Get top performing drivers
 * Query params: range (week|month|quarter|year|all), limit (default: 10)
 */
router.get('/leaderboard', 
  authenticate, 
  authorize('admin', 'accountant', 'driver'), 
  fuelEfficiencyController.getLeaderboard
);

// ==================== Alerts Routes ====================

/**
 * GET /api/fuel-efficiency/alerts
 * Get efficiency alerts (low performers)
 * Query params: range (week|month|quarter|year)
 */
router.get('/alerts', 
  authenticate, 
  authorize('admin', 'accountant'), 
  fuelEfficiencyController.getEfficiencyAlerts
);

export default router;