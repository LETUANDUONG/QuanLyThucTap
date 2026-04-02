import { Router } from 'express';
import { changePassword, login } from '../controllers/authController.js';

const router = Router();

router.post('/auth/login', login);
router.post('/auth/change-password', changePassword);

export default router;
