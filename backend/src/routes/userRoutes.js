import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getAccounts,
  getStudentById,
  getStudents,
  getTeacherById,
  getTeachers,
  updateUserStatus,
} from '../controllers/userController.js';

const router = Router();

router.get('/tai-khoan', getAccounts);
router.get('/sinh-vien', getStudents);
router.get('/sinh-vien/:id', getStudentById);
router.get('/giang-vien', getTeachers);
router.get('/giang-vien/:id', getTeacherById);

router.post('/nguoi-dung', createUser);
router.patch('/nguoi-dung/:role/:id/status', updateUserStatus);
router.delete('/nguoi-dung/:role/:id', deleteUser);

export default router;
