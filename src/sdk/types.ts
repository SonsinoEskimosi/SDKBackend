export interface BaseRecorder {
  name: string;
  isActive: boolean;
  start(): void;
  stop(): void;
  getData(): any;
  reset(): void;
}

