import { RecorderManager } from './RecorderManager';
import { ImagesViewRecorder } from './ImagesViewRecorder';
import { BACKEND_HOST } from './constants';

(function() {
  'use strict';
  
  // Prevent multiple initializations
  if ((window as any).JSSDK) {
    console.log('[JSSDK] Already initialized, skipping');
    return;
  }
  
  console.log('[JSSDK] Loaded');
  
  async function initializeEskimoId(): Promise<string> {
    const STORAGE_KEY = 'eskimoId';
    
    let eskimoId: string | null = localStorage.getItem(STORAGE_KEY);
    
    if (!eskimoId) {
      try {
        const response = await fetch(`${BACKEND_HOST}/api/eskimo-id`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            host: window.location.hostname
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          eskimoId = data.eskimoId as string;
          localStorage.setItem(STORAGE_KEY, eskimoId);
          console.log('[JSSDK] Generated new eskimoId:', eskimoId);
        } else {
          console.error('[JSSDK] Failed to get eskimoId:', response.status);
          eskimoId = 'unknown';
        }
      } catch (error) {
        console.error('[JSSDK] Error getting eskimoId:', error);
        eskimoId = 'unknown';
      }
    } else {
      console.log('[JSSDK] Using existing eskimoId:', eskimoId);
    }
    
    return eskimoId;
  }
  
  initializeEskimoId().then(eskimoId => {
    const recorderManager = new RecorderManager();
    recorderManager.setEskimoId(eskimoId);
    recorderManager.register(new ImagesViewRecorder());

    (window as any).JSSDK = {
      version: '1.0.0',
      eskimoId,
      recorderManager
    };

    recorderManager.startAll();
  });
})();

