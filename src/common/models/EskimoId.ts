import mongoose, { Document, Schema } from 'mongoose';

export interface IEskimoId extends Document {
  eskimoId: string;
  host: string;
  cookie: string;
  createdAt: Date;
}

const EskimoIdSchema: Schema = new Schema({
  eskimoId: { type: String, required: true, unique: true },
  host: { type: String, required: true },
  cookie: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const EskimoId = mongoose.model<IEskimoId>('EskimoId', EskimoIdSchema, 'eskimo_ids');
