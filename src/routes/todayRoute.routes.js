import express from 'express';
import todayRouteController from '../controllers/todayRoute.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

/**
 * TodayRoute Routes
 * Base path: /api/driver/today-route
 * All routes require authentication and driver/admin role
 */

// ==================== Dashboard ====================
router.get('/', authenticate, authorize('driver', 'admin'), todayRouteController.getDashboard);
router.get('/stats', authenticate, authorize('driver', 'admin'), todayRouteController.getQuickStats);

// ==================== Assignment ====================
router.get('/assignment', authenticate, authorize('driver', 'admin'), todayRouteController.getTodayAssignment);
router.get('/assignments/active', authenticate, authorize('driver', 'admin'), todayRouteController.getActiveAssignments);

// ==================== Fitness Check ====================
router.get('/fitness', authenticate, authorize('driver', 'admin'), todayRouteController.getFitnessCheck);
router.post('/fitness', authenticate, authorize('driver', 'admin'), todayRouteController.submitFitnessCheck);
router.get('/fitness/history', authenticate, authorize('driver', 'admin'), todayRouteController.getFitnessHistory);

// ==================== Odometer ====================
router.get('/odometer', authenticate, authorize('driver', 'admin'), todayRouteController.getOdometerReadings);
router.post('/odometer', authenticate, authorize('driver', 'admin'), todayRouteController.submitOdometerReading);
router.get('/odometer/history', authenticate, authorize('driver', 'admin'), todayRouteController.getOdometerHistory);

// ==================== Fuel ====================
router.get('/fuel', authenticate, authorize('driver', 'admin'), todayRouteController.getFuelEntries);
router.post('/fuel', authenticate, authorize('driver', 'admin'), todayRouteController.submitFuelEntry);
router.get('/fuel/efficiency', authenticate, authorize('driver', 'admin'), todayRouteController.getFuelEfficiencyReport);
router.get('/fuel/summary', authenticate, authorize('driver', 'admin'), todayRouteController.getFuelCostSummary);
router.get('/driver-fuel-history', authenticate, authorize('driver', 'admin'), todayRouteController.getDriverFuelHistory);

export default router;
