import { Router } from 'express';
import {
  getAccounts,
  getDashboardSummary,
  getNotifications,
  getRegistrationApprovalView,
  getRegistrationById,
  getRegistrations,
  getReportById,
  getReports,
  getReportSubmissions,
  getSemesterById,
  getSemesters,
  getStudentById,
  getStudents,
  getTeacherById,
  getTeachers,
  getTopicById,
  getTopics,
  getTopicSummary,
} from '../controllers/readController.js';

const router = Router();

router.get('/dashboard/summary', getDashboardSummary);

router.get('/hoc-ky', getSemesters);
router.get('/hoc-ky/:id', getSemesterById);

router.get('/tai-khoan', getAccounts);

router.get('/sinh-vien', getStudents);
router.get('/sinh-vien/:id', getStudentById);

router.get('/giang-vien', getTeachers);
router.get('/giang-vien/:id', getTeacherById);

router.get('/de-tai', getTopics);
router.get('/de-tai/tong-hop', getTopicSummary);
router.get('/de-tai/:id', getTopicById);

router.get('/dang-ky', getRegistrations);
router.get('/dang-ky/duyet', getRegistrationApprovalView);
router.get('/dang-ky/:id', getRegistrationById);

router.get('/bao-cao', getReports);
router.get('/bao-cao/nop', getReportSubmissions);
router.get('/bao-cao/:id', getReportById);

router.get('/thong-bao', getNotifications);

export default router;
