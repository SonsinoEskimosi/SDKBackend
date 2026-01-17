import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { EskimoId } from '../../common/models/EskimoId';
import { UserImageView } from '../../common/models/UserImageView';
import { queueImagesForProcessing, getPendingBatches, getQueueStatus } from '../../common/services/imageProcessor';
import logger from '../../common/utils/logger';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

router.post('/eskimo-id', async (req, res) => {
  try {
    const { host } = req.body;
    
    if (!host) {
      return res.status(400).json({ error: 'Host is required' });
    }

    const eskimoId = uuidv4();
    
    await EskimoId.create({
      eskimoId,
      host,
      cookie: eskimoId,
      createdAt: new Date()
    });

    logger.info(`[EskimoId] Generated new ID: ${eskimoId} for host: ${host}`);

    res.json({ eskimoId });
  } catch (error: any) {
    logger.error('[EskimoId] Error generating ID:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await EskimoId.find({}).sort({ createdAt: -1 }).limit(100);
    res.json(users);
  } catch (error: any) {
    logger.error('[Users] Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/batches', async (req, res) => {
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

router.post('/events', async (req, res) => {
  const { timestamp, eskimoId, data } = req.body;
  
  logger.info(`[Events] Received at: ${timestamp} from eskimoId: ${eskimoId}`);
  
  if (data.imagesView?.images?.length > 0) {
    const images = data.imagesView.images;
    logger.info(`[Queue] Queueing ${images.length} images from eskimoId: ${eskimoId}`);
    
    queueImagesForProcessing(images);
    
    for (const imageUrl of images) {
      await UserImageView.create({
        eskimoId,
        imageUrl,
        viewDuration: 3000,
        viewedAt: new Date()
      });
    }
    
    logger.info(`[Analytics] Saved ${images.length} image views for eskimoId: ${eskimoId}`);
  }
  
  res.json({ received: true, timestamp: new Date().toISOString() });
});

export default router;
