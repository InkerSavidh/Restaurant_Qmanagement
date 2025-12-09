// Backend/src/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import authRoutes from './auth/auth.routes.js';
import tablesRoutes from './tables/tables.routes.js';
import floorsRoutes from './tables/floors.routes.js';
import queueRoutes from './queue/queue.routes.js';
import allocatorRoutes from './queue/allocator.routes.js';
import seatingRoutes from './seating/seating.routes.js';
import analyticsRoutes from './analytics/analytics.routes.js';
import activityRoutes from './activity/activity.routes.js';
import waitersRoutes from './waiters/waiters.routes.js';
import historyRoutes from './history/history.routes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tables', tablesRoutes);
app.use('/api/floors', floorsRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/allocator', allocatorRoutes);
app.use('/api/seating', seatingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/waiters', waitersRoutes);
app.use('/api/history', historyRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
