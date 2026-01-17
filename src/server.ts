import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import * as esbuild from 'esbuild';
import mongoose from 'mongoose';
import { ImageScanResult } from './models/ImageScanResult';
import OpenAI from 'openai';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/eskimosi';

mongoose.connect(MONGO_URL)
  .then(() => console.log('[MongoDB] Connected to', MONGO_URL))
  .catch(err => console.error('[MongoDB] Connection error:', err));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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
    console.error('[SDK Build Error]', error);
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

app.post('/api/events', async (req, res) => {
  const { timestamp, data } = req.body;
  
  console.log('[Events] Received at:', timestamp);
  
  if (data.imagesView?.images?.length > 0) {
    const images = data.imagesView.images;
    console.log(`[AI] Processing ${images.length} images...`);
    
    processImagesWithAI(images);
  }
  
  res.json({ received: true, timestamp: new Date().toISOString() });
});

async function processImagesWithAI(imageUrls: string[]) {
  for (const imageUrl of imageUrls) {
    try {
      const existing = await ImageScanResult.findOne({ imageUrl });
      
      if (existing) {
        console.log(`[AI] Skipping ${imageUrl} (already scanned)`);
        continue;
      }

      console.log(`[AI] Analyzing with GPT-4 Vision: ${imageUrl}...`);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this fashion product image. Describe the colors and style with simple labels:
- Product type (jacket, dress, pants, etc.)
- Colors (be specific)
- Style/pattern (denim, floral, solid, striped, etc.)
- Fit (oversized, fitted, slim, etc.)
- Material/fabric if visible
- Notable features (buttons, zipper, pockets, etc.)

Return only a comma-separated list of labels, no explanations.`
              },
              {
                type: "image_url",
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 200
      });

      const content = response.choices[0].message.content || '';
      const labelStrings = content.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      const labels = labelStrings.map(label => ({
        description: label,
        score: 0.9
      }));

      await ImageScanResult.create({
        imageUrl,
        labels,
        webEntities: [],
        dominantColor: undefined
      });

      console.log(`\n[AI] Image: ${imageUrl}`);
      console.log(`[AI] Fashion Labels:`);
      labels.forEach((label: any) => {
        console.log(`  - ${label.description}`);
      });
      console.log('[MongoDB] Saved to database\n');
      
    } catch (error: any) {
      console.error(`[AI] Failed to process ${imageUrl}:`, error.message);
    }
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}`);
  console.log(`SDK available at http://localhost:${PORT}/sdk/sdk.js`);
});

