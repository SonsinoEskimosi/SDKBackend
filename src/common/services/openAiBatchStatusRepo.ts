import redisClient from './redisClient';
import logger from '../utils/logger';

const REDIS_BATCH_JOBS_KEY = 'batch_jobs';

interface BatchJobData {
  batchId: string;
  imageUrls: string[];
  createdAt: string;
  status: string;
}

export async function saveBatch(batchId: string, imageUrls: string[]): Promise<void> {
  const batchData: BatchJobData = {
    batchId,
    imageUrls,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  
  await redisClient.hSet(REDIS_BATCH_JOBS_KEY, batchId, JSON.stringify(batchData));
  logger.info(`[BatchManager] Saved batch ${batchId} with ${imageUrls.length} images`);
}

export async function removeBatch(batchId: string): Promise<void> {
  await redisClient.hDel(REDIS_BATCH_JOBS_KEY, batchId);
  logger.info(`[BatchManager] Removed batch ${batchId}`);
}

export async function getBatchData(batchId: string): Promise<BatchJobData | null> {
  const batchData = await redisClient.hGet(REDIS_BATCH_JOBS_KEY, batchId);
  if (!batchData) return null;
  
  return JSON.parse(batchData);
}

export async function getBatchImages(batchId: string): Promise<string[] | null> {
  const batchData = await getBatchData(batchId);
  return batchData ? batchData.imageUrls : null;
}

export async function getAllPendingBatches(): Promise<BatchJobData[]> {
  const pendingBatches = await redisClient.hGetAll(REDIS_BATCH_JOBS_KEY);
  return Object.values(pendingBatches).map(data => JSON.parse(data));
}

export async function getPendingBatchesSummary(): Promise<any[]> {
  const batches = await getAllPendingBatches();
  return batches.map(batch => ({
    batchId: batch.batchId,
    imageCount: batch.imageUrls.length,
    createdAt: batch.createdAt,
    status: batch.status
  }));
}

export async function getAllBatchIds(): Promise<string[]> {
  const pendingBatches = await redisClient.hGetAll(REDIS_BATCH_JOBS_KEY);
  return Object.keys(pendingBatches);
}
