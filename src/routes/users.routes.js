import { Router } from 'express';
import { createUserController, getUserController, listUsersController, updateUserController } from '../controllers/users.controller.js';
import { validate } from '../middlewares/validate.js';
import { createUserSchema, updateUserSchema } from '../schemas/users.schema.js';
import { authenticate, authorize } from '../middlewares/auth.js';


const router = Router();


// Admin-only user management
router.post('/', authenticate, authorize('admin'), validate(createUserSchema), createUserController);
router.get('/', authenticate, authorize('admin'), listUsersController);
router.get('/:id', authenticate, authorize('admin'), validate(updateUserSchema), getUserController);
router.patch('/:id', authenticate, authorize('admin'), validate(updateUserSchema), updateUserController);


export default router;