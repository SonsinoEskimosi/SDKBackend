import { RecorderManager } from './RecorderManager';
import { ImagesViewRecorder } from './ImagesViewRecorder';

(function() {
  'use strict';
  
  console.log('[JSSDK] Loaded');
  
  const recorderManager = new RecorderManager();
  recorderManager.register(new ImagesViewRecorder());

  (window as any).JSSDK = {
    version: '1.0.0',
    recorderManager
  };

  recorderManager.startAll();
})();

