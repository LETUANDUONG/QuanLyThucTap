import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import readRoutes from './routes/readRoutes.js';
import writeRoutes from './routes/writeRoutes.js';

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
app.use('/api', readRoutes);
app.use('/api', writeRoutes);

export default app;
