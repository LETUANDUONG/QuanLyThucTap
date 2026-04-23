import { Router } from 'express';
import { createNotification, getNotifications } from '../controllers/notificationController.js';

const router = Router();

router.get('/thong-bao', getNotifications);
router.post('/thong-bao', createNotification);

export default router;
