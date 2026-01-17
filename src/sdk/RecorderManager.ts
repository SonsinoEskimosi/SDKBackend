import { BaseRecorder } from './types';
import { BACKEND_HOST } from './constants';

export class RecorderManager {
  private recorders: Map<string, BaseRecorder>;
  private flushInterval: number | null = null;
  private backendUrl: string = `${BACKEND_HOST}/api/events`;
  private eskimoId: string = '';

  constructor() {
    this.recorders = new Map();
  }

  setEskimoId(eskimoId: string): void {
    this.eskimoId = eskimoId;
  }

  register(recorder: BaseRecorder): void {
    this.recorders.set(recorder.name, recorder);
  }

  get(name: string): BaseRecorder | undefined {
    return this.recorders.get(name);
  }

  startAll(): void {
    this.recorders.forEach(recorder => recorder.start());
    this.startFlushInterval();
  }

  stopAll(): void {
    this.recorders.forEach(recorder => recorder.stop());
    this.stopFlushInterval();
  }

  getAllData(): Record<string, any> {
    const data: Record<string, any> = {};
    this.recorders.forEach((recorder, name) => {
      data[name] = recorder.getData();
    });
    return data;
  }

  private startFlushInterval(): void {
    if (this.flushInterval !== null) return;
    
    this.flushInterval = window.setInterval(() => {
      this.flushToBackend();
    }, 10000);
  }

  private stopFlushInterval(): void {
    if (this.flushInterval !== null) {
      window.clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  private async flushToBackend(): Promise<void> {
    const data = this.getAllData();
    
    const hasData = Object.values(data).some(recorderData => {
      if (recorderData.totalImages !== undefined) {
        return recorderData.totalImages > 0;
      }
      return true;
    });
    
    if (!hasData) return;
    
    try {
      await fetch(this.backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          eskimoId: this.eskimoId,
          data
        })
      });
      
      this.recorders.forEach(recorder => recorder.reset());
      console.log('[RecorderManager] Flushed to backend');
    } catch (error) {
      console.error('[RecorderManager] Flush failed:', error);
    }
  }
}

