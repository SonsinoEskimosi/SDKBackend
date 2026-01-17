import mongoose, { Document, Schema } from 'mongoose';

export interface IUserImageView extends Document {
  eskimoId: string;
  imageUrl: string;
  viewDuration: number;
  viewedAt: Date;
}

const UserImageViewSchema: Schema = new Schema({
  eskimoId: { type: String, required: true, index: true },
  imageUrl: { type: String, required: true },
  viewDuration: { type: Number, required: true },
  viewedAt: { type: Date, default: Date.now }
});

UserImageViewSchema.index({ eskimoId: 1, imageUrl: 1 });

export const UserImageView = mongoose.model<IUserImageView>('UserImageView', UserImageViewSchema, 'user_image_views');
