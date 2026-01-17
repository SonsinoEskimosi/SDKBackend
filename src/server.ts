import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { processBatchFromQueue, resumePendingBatches } from './common/services/imageProcessor';
import { connectRedis } from './common/services/redisClient';
import apiRoutes from './api/routes/api';
import sdkBundleRoutes from './sdk/routes/bundle';
import dashboardRoutes from './app/routes/dashboard';
import logger from './common/utils/logger';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/eskimosi';

mongoose.connect(MONGO_URL)
  .then(() => logger.info(`[MongoDB] Connected to ${MONGO_URL}`))
  .catch(err => logger.error('[MongoDB] Connection error:', err));

connectRedis()
  .then(() => resumePendingBatches())
  .catch(err => logger.error('[Redis] Connection error:', err));

const app = express();
const isDev = process.env.NODE_ENV === 'development';
const PORT = process.env.PORT || (isDev ? 3001 : 80);

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to JSSDK Backend API' });
});

app.use('/api', apiRoutes);
app.use('/sdk', sdkBundleRoutes);
app.use('/dashboard', dashboardRoutes);

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Visit http://localhost:${PORT}`);
  logger.info(`SDK available at http://localhost:${PORT}/sdk/sdk.js`);
});

// Process batch every 5 minutes
setInterval(() => {
  logger.info('[Scheduler] Running batch processor...');
  processBatchFromQueue().catch(err => logger.error('[Scheduler] Error:', err));
}, 5 * 60 * 1000);
