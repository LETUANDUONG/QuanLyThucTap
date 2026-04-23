import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { verifyToken } from './middleware/authMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import semesterRoutes from './routes/semesterRoutes.js';
import topicRoutes from './routes/topicRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(
  cors({
    origin: (_origin, callback) => {
      callback(null, process.env.FRONTEND_URL || 'http://localhost:5173');
    },
  }),
);
app.use(express.json());
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.get('/', (_req, res) => {
  res.json({
    message: 'Backend Quan Ly Thuc Tap is running',
  });
});

app.use('/api', healthRoutes);
app.use('/api', authRoutes);

// Apply JWT authentication to all routes below
app.use('/api', verifyToken);

app.use('/api', dashboardRoutes);
app.use('/api', semesterRoutes);
app.use('/api', userRoutes);
app.use('/api', topicRoutes);
app.use('/api', registrationRoutes);
app.use('/api', reportRoutes);
app.use('/api', notificationRoutes);

export default app;
