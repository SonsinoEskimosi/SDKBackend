import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import * as esbuild from 'esbuild';
import mongoose from 'mongoose';
import { queueImagesForProcessing, processBatchFromQueue, resumePendingBatches, getPendingBatches, getQueueStatus } from './services/imageProcessor';
import { connectRedis } from './services/redisClient';
import logger from './utils/logger';

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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Build and serve SDK dynamically
app.get('/sdk/sdk.js', async (req, res) => {
  try {
    const result = await esbuild.build({
      entryPoints: [path.join(__dirname, '../js_sdk/sdk.ts')],
      bundle: true,
      format: 'iife',
      write: false,
      minify: false
    });

    const code = result.outputFiles[0].text;
    
    res.setHeader('Content-Type', 'application/javascript');
    res.send(code);
  } catch (error) {
    logger.error('[SDK Build Error]', error);
    res.status(500).json({ error: 'Failed to build SDK' });
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to JSSDK Backend API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/batches', async (req, res) => {
  try {
    const batches = await getPendingBatches();
    const queue = await getQueueStatus();
    res.json({ 
      pendingBatches: batches,
      queue: queue
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events', async (req, res) => {
  const { timestamp, data } = req.body;
  
  logger.info(`[Events] Received at: ${timestamp}`);
  
  if (data.imagesView?.images?.length > 0) {
    const images = data.imagesView.images;
    logger.info(`[Queue] Queueing ${images.length} images...`);
    
    queueImagesForProcessing(images);
  }
  
  res.json({ received: true, timestamp: new Date().toISOString() });
});

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
