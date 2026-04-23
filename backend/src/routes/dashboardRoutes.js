import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';

const router = Router();

router.get('/dashboard/summary', getDashboardSummary);

export default router;
