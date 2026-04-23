import { Router } from 'express';
import {
  createSemester,
  deleteSemester,
  getSemesterById,
  getSemesters,
  updateSemester,
} from '../controllers/semesterController.js';

const router = Router();

router.get('/hoc-ky', getSemesters);
router.get('/hoc-ky/:id', getSemesterById);
router.post('/hoc-ky', createSemester);
router.put('/hoc-ky/:id', updateSemester);
router.delete('/hoc-ky/:id', deleteSemester);

export default router;
