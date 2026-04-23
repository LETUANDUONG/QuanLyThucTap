import { Router } from 'express';
import {
  createRegistration,
  deleteRegistration,
  getRegistrationApprovalView,
  getRegistrationById,
  getRegistrations,
  updateRegistrationStatus,
} from '../controllers/registrationController.js';

const router = Router();

router.get('/dang-ky', getRegistrations);
router.get('/dang-ky/duyet', getRegistrationApprovalView);
router.get('/dang-ky/:id', getRegistrationById);
router.post('/dang-ky', createRegistration);
router.patch('/dang-ky/:id/status', updateRegistrationStatus);
router.delete('/dang-ky/:id', deleteRegistration);

export default router;
