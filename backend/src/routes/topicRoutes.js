import { Router } from 'express';
import {
  createTopic,
  deleteTopic,
  getTopicById,
  getTopics,
  getTopicSummary,
  updateTopic,
} from '../controllers/topicController.js';

const router = Router();

router.get('/de-tai', getTopics);
router.get('/de-tai/tong-hop', getTopicSummary);
router.get('/de-tai/:id', getTopicById);
router.post('/de-tai', createTopic);
router.put('/de-tai/:id', updateTopic);
router.delete('/de-tai/:id', deleteTopic);

export default router;
