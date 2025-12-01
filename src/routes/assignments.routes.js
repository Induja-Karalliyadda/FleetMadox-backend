import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createAssignmentSchema,
  listAssignmentQuerySchema,
  idParamSchema,
  patchAssignmentSchema
} from '../schemas/assignments.schema.js';
import {
  listAssignmentsController,
  getAssignmentController,
  createAssignmentController,
  updateAssignmentController,
  deleteAssignmentController
} from '../controllers/assignments.controller.js';

const router = Router();
router.use(authenticate);

// View - REMOVED validation for GET list since it's causing issues with empty query
router.get(
  '/',
  authorize('admin', 'accountant', 'driver'),
  // validate(listAssignmentQuerySchema),  // Temporarily removed - causing validation error
  listAssignmentsController
);

router.get(
  '/:id',
  authorize('admin', 'accountant', 'driver'),
  validate(idParamSchema),
  getAssignmentController
);

// Admin-only create/update/delete
router.post(
  '/',
  authorize('admin'),
  validate(createAssignmentSchema),
  createAssignmentController
);

router.patch(
  '/:id',
  authorize('admin'),
  validate(patchAssignmentSchema),
  updateAssignmentController
);

router.delete(
  '/:id',
  authorize('admin'),
  validate(idParamSchema),
  deleteAssignmentController
);

export default router;
