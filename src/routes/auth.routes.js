import { Router } from 'express';
import { loginController, meController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema } from '../schemas/auth.schema.js';
import { authenticate } from '../middlewares/auth.js';


const router = Router();


router.post('/login', validate(loginSchema), loginController);
router.get('/me', authenticate, meController);


export default router;