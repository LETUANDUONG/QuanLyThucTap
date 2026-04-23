import { Router } from 'express';
import {
  createReport,
  deleteReport,
  getReportById,
  getReports,
  getReportSubmissions,
  gradeReport,
  submitReport,
  updateReport,
} from '../controllers/reportController.js';

const router = Router();

router.get('/bao-cao', getReports);
router.get('/bao-cao/nop', getReportSubmissions);
router.get('/bao-cao/:id', getReportById);

router.post('/bao-cao', createReport);
router.put('/bao-cao/:id', updateReport);
router.delete('/bao-cao/:id', deleteReport);
router.post('/bao-cao/:id/nop', submitReport);
router.patch('/bao-cao/:reportId/cham/:studentId', gradeReport);

export default router;
