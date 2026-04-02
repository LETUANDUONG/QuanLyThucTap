import { Router } from 'express';
import {
  createNotification,
  createRegistration,
  createReport,
  createSemester,
  createTopic,
  createUser,
  deleteUser,
  deleteRegistration,
  deleteReport,
  deleteSemester,
  deleteTopic,
  gradeReport,
  submitReport,
  updateRegistrationStatus,
  updateReport,
  updateSemester,
  updateTopic,
  updateUserStatus,
} from '../controllers/writeController.js';

const router = Router();

router.post('/hoc-ky', createSemester);
router.put('/hoc-ky/:id', updateSemester);
router.delete('/hoc-ky/:id', deleteSemester);

router.post('/nguoi-dung', createUser);
router.patch('/nguoi-dung/:role/:id/status', updateUserStatus);
router.delete('/nguoi-dung/:role/:id', deleteUser);

router.post('/de-tai', createTopic);
router.put('/de-tai/:id', updateTopic);
router.delete('/de-tai/:id', deleteTopic);

router.post('/dang-ky', createRegistration);
router.patch('/dang-ky/:id/status', updateRegistrationStatus);
router.delete('/dang-ky/:id', deleteRegistration);

router.post('/bao-cao', createReport);
router.put('/bao-cao/:id', updateReport);
router.delete('/bao-cao/:id', deleteReport);
router.post('/bao-cao/:id/nop', submitReport);
router.patch('/bao-cao/:reportId/cham/:studentId', gradeReport);

router.post('/thong-bao', createNotification);

export default router;
