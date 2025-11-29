import { BaseRecorder } from './types';

export class RecorderManager {
  private recorders: Map<string, BaseRecorder>;

  constructor() {
    this.recorders = new Map();
  }

  register(recorder: BaseRecorder): void {
    this.recorders.set(recorder.name, recorder);
  }

  get(name: string): BaseRecorder | undefined {
    return this.recorders.get(name);
  }

  startAll(): void {
    this.recorders.forEach(recorder => recorder.start());
  }

  stopAll(): void {
    this.recorders.forEach(recorder => recorder.stop());
  }

  getAllData(): Record<string, any> {
    const data: Record<string, any> = {};
    this.recorders.forEach((recorder, name) => {
      data[name] = recorder.getData();
    });
    return data;
  }
}

