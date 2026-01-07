import mongoose, { Schema, Document } from 'mongoose';

export interface GlobalClicksDocument extends Document {
  count: number;
  updatedAt: Date;
}

const GlobalClicksSchema = new Schema<GlobalClicksDocument>(
  {
    count: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
    collection: 'globalClicks',
  }
);

export default mongoose.models.GlobalClicks ||
  mongoose.model<GlobalClicksDocument>('GlobalClicks', GlobalClicksSchema);
