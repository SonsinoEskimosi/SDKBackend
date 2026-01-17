import OpenAI from 'openai';
import { ImageScanResult } from '../models/ImageScanResult';
import { FASHION_ANALYSIS_PROMPT } from '../constants/prompts';
import redisClient from './redisClient';
import * as openAiBatchStatusRepo from './openAiBatchStatusRepo';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const REDIS_QUEUE_KEY = 'image_processing_queue';

export async function queueImagesForProcessing(imageUrls: string[]) {
  for (const imageUrl of imageUrls) {
    const alreadyProcessed = await ImageScanResult.findOne({ imageUrl });
    const alreadyQueued = await redisClient.sIsMember(REDIS_QUEUE_KEY, imageUrl);
    
    if (!alreadyProcessed && !alreadyQueued) {
      await redisClient.sAdd(REDIS_QUEUE_KEY, imageUrl);
      logger.info(`[Queue] Added: ${imageUrl}`);
    }
  }
}

export async function processBatchFromQueue() {
  const queuedImages = await redisClient.sMembers(REDIS_QUEUE_KEY);
  
  if (queuedImages.length === 0) {
    logger.info('[Batch] No images in queue');
    return;
  }

  logger.info(`[Batch] Processing ${queuedImages.length} images...`);

  const batchRequests = queuedImages.map((imageUrl, index) => ({
    custom_id: `request-${index}`,
    method: "POST",
    url: "/v1/chat/completions",
    body: {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: FASHION_ANALYSIS_PROMPT
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 250
    }
  }));

  const batchFilePath = path.join(__dirname, '../../temp_batch.jsonl');
  const jsonlContent = batchRequests.map(req => JSON.stringify(req)).join('\n');
  fs.writeFileSync(batchFilePath, jsonlContent);

  const batchInputFile = await openai.files.create({
    file: fs.createReadStream(batchFilePath),
    purpose: "batch"
  });

  const batch = await openai.batches.create({
    input_file_id: batchInputFile.id,
    endpoint: "/v1/chat/completions",
    completion_window: "24h"
  });

  fs.unlinkSync(batchFilePath);

  logger.info(`[Batch] Created: ${batch.id}`);

  await openAiBatchStatusRepo.saveBatch(batch.id, queuedImages);

  await redisClient.del(REDIS_QUEUE_KEY);
  logger.info('[Queue] Cleared');

  await pollBatchUntilComplete(batch.id);
}

async function pollBatchUntilComplete(batchId: string) {
  const imageUrls = await openAiBatchStatusRepo.getBatchImages(batchId);
  
  if (!imageUrls) {
    logger.error(`[Batch ${batchId}] No image URLs found in Redis`);
    return;
  }

  let completedBatch = await openai.batches.retrieve(batchId);
  
  while (completedBatch.status !== 'completed' && completedBatch.status !== 'failed' && completedBatch.status !== 'cancelled') {
    await new Promise(resolve => setTimeout(resolve, 10000));
    completedBatch = await openai.batches.retrieve(batchId);
    logger.info(`[Batch ${batchId}] Status: ${completedBatch.status}`);
  }

  if (completedBatch.status === 'completed' && completedBatch.output_file_id) {
    const fileResponse = await openai.files.content(completedBatch.output_file_id);
    const fileContents = await fileResponse.text();
    const results = fileContents.trim().split('\n').map(line => JSON.parse(line));

    for (const result of results) {
      const index = parseInt(result.custom_id.split('-')[1]);
      const imageUrl = imageUrls[index];
      
      try {
        const content = result.response.body.choices[0].message.content || '';
        
        if (content.includes('NOT_FASHION_ITEM')) {
          logger.info(`[Batch] Skipped (not fashion): ${imageUrl}`);
          continue;
        }
        
        const labelStrings = content.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        
        const labels = labelStrings.map((label: string) => ({
          description: label,
          score: 0.9
        }));

        await ImageScanResult.create({
          imageUrl,
          labels
        });

        logger.info(`[Batch] Saved: ${imageUrl} (${labels.length} labels)`);
      } catch (error: any) {
        logger.error(`[Batch] Failed to process ${imageUrl}: ${error.message}`);
      }
    }

    logger.info(`[Batch ${batchId}] Complete`);
  } else {
    logger.error(`[Batch ${batchId}] Failed with status: ${completedBatch.status}`);
  }

  await openAiBatchStatusRepo.removeBatch(batchId);
}

export async function resumePendingBatches() {
  const batchIds = await openAiBatchStatusRepo.getAllBatchIds();
  
  if (batchIds.length === 0) {
    logger.info('[Batch] No pending batches to resume');
    return;
  }

  logger.info(`[Batch] Resuming ${batchIds.length} pending batches...`);

  for (const batchId of batchIds) {
    logger.info(`[Batch] Resuming: ${batchId}`);
    
    pollBatchUntilComplete(batchId).catch(err => {
      logger.error(`[Batch ${batchId}] Resume error: ${err}`);
    });
  }
}

export async function getPendingBatches() {
  return await openAiBatchStatusRepo.getPendingBatchesSummary();
}

export async function getQueueStatus() {
  const queuedImages = await redisClient.sMembers(REDIS_QUEUE_KEY);
  return {
    queuedImages: queuedImages.length,
    images: queuedImages
  };
}
