import { Router } from 'express';
import * as esbuild from 'esbuild';
import path from 'path';
import logger from '../../common/utils/logger';

const router = Router();

router.get('/sdk.js', async (req, res) => {
  try {
    const result = await esbuild.build({
      entryPoints: [path.join(__dirname, '../sdk.ts')],
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

export default router;
