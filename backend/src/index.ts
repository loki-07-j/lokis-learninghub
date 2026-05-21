import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler';

import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import courseRoutes from './routes/course.routes';
import practiceRoutes from './routes/practice.routes';
import progressRoutes from './routes/progress.routes';
import plannerRoutes from './routes/planner.routes';
import testRoutes from './routes/test.routes';
import revisionRoutes from './routes/revision.routes';
import rapidFireRoutes from './routes/rapidfire.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/revision', revisionRoutes);
app.use('/api/rapid-fire', rapidFireRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: "Loki's Learning Hub API is running" });
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
