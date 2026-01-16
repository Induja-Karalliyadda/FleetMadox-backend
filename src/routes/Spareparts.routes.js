// src/routes/Spareparts.routes.js
import express from 'express';
import * as sparePartsController from '../controllers/Spareparts.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { 
    createSparePartSchema, 
    updateSparePartSchema,
    installSparePartSchema,
    updateVehicleSparePartSchema 
} from '../schemas/Spareparts.schema.js';

const router = express.Router();

// ==================== SPARE PART MASTER ROUTES ====================

// GET /api/spare-part - Get all spare parts
router.get(
    '/',
    authenticate,
    sparePartsController.getAllSpareParts
);

// GET /api/spare-part/:id - Get single spare part
router.get(
    '/:id',
    authenticate,
    sparePartsController.getSparePartById
);

// POST /api/spare-part - Create new spare part (Admin only)
router.post(
    '/',
    authenticate,
    authorize('admin'),
    validate(createSparePartSchema),
    sparePartsController.createSparePart
);

// PUT /api/spare-part/:id - Update spare part (Admin only)
router.put(
    '/:id',
    authenticate,
    authorize('admin'),
    validate(updateSparePartSchema),
    sparePartsController.updateSparePart
);

// DELETE /api/spare-part/:id - Delete spare part (Admin only)
router.delete(
    '/:id',
    authenticate,
    authorize('admin'),
    sparePartsController.deleteSparePart
);

// ==================== VEHICLE SPARE PART ROUTES ====================

// GET /api/spare-part/vehicle/all - Get all installations (with optional filters)
router.get(
    '/vehicle/all',
    authenticate,
    sparePartsController.getAllVehicleSpareParts
);

// GET /api/spare-part/vehicle/alerts/replacement - Get replacement alerts
router.get(
    '/vehicle/alerts/replacement',
    authenticate,
    sparePartsController.getReplacementAlerts
);

// GET /api/spare-part/vehicle/bus/:busId/status - Get spare part status for a bus
router.get(
    '/vehicle/bus/:busId/status',
    authenticate,
    sparePartsController.getBusSparePartStatus
);

// GET /api/spare-part/vehicle/:id - Get single installation
router.get(
    '/vehicle/:id',
    authenticate,
    sparePartsController.getVehicleSparePartById
);

// POST /api/spare-part/vehicle - Install spare part on vehicle (Admin only)
router.post(
    '/vehicle',
    authenticate,
    authorize('admin'),
    validate(installSparePartSchema),
    sparePartsController.installSparePart
);

// PUT /api/spare-part/vehicle/:id - Update installation (Admin only)
router.put(
    '/vehicle/:id',
    authenticate,
    authorize('admin'),
    validate(updateVehicleSparePartSchema),
    sparePartsController.updateVehicleSparePart
);

// DELETE /api/spare-part/vehicle/:id - Delete installation (Admin only)
router.delete(
    '/vehicle/:id',
    authenticate,
    authorize('admin'),
    sparePartsController.deleteVehicleSparePart
);

// POST /api/spare-part/vehicle/:id/replace - Replace spare part (Admin only)
router.post(
    '/vehicle/:id/replace',
    authenticate,
    authorize('admin'),
    validate(installSparePartSchema),
    sparePartsController.replaceSparePart
);

// ==================== MAINTENANCE LOG ROUTES ====================

// GET /api/spare-part/maintenance-logs - Get maintenance logs
router.get(
    '/maintenance-logs',
    authenticate,
    sparePartsController.getMaintenanceLogs
);

// ==================== ODOMETER ROUTES ====================

// GET /api/spare-part/odometer/bus/:busId/latest - Get latest odometer for a bus
router.get(
    '/odometer/bus/:busId/latest',
    authenticate,
    sparePartsController.getLatestOdometerByBus
);

export default router;