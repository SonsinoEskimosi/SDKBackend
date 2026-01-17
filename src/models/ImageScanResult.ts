import mongoose from 'mongoose';

const imageScanResultSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  labels: [{
    description: String,
    score: Number
  }],
  scannedAt: { type: Date, default: Date.now }
});

export const ImageScanResult = mongoose.model('images_scan_results', imageScanResultSchema);
