import mongoose from 'mongoose';

const imageScanResultSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  labels: [{
    description: String,
    score: Number
  }],
  webEntities: [{
    description: String,
    score: Number
  }],
  dominantColor: {
    red: Number,
    green: Number,
    blue: Number
  },
  scannedAt: { type: Date, default: Date.now }
});

export const ImageScanResult = mongoose.model('images_scan_results', imageScanResultSchema);
