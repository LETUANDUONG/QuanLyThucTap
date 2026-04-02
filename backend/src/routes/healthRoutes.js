import { Router } from 'express';
import {
  getHealth,
  getSqlVersion,
  testDatabaseConnection,
} from '../controllers/healthController.js';

const router = Router();

router.get('/health', getHealth);
router.get('/db-test', testDatabaseConnection);
router.get('/db-version', getSqlVersion);

export default router;
