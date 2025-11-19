import mongoose, { Schema, Document } from 'mongoose';

export interface ClickDocument extends Document {
    linkId: mongoose.Types.ObjectId;
    userId: string;
    country: string;
    timestamp: Date;
    userAgent?: string;
    deviceType?: 'mobile' | 'desktop' | 'tablet' | 'unknown';
    source?: string;
}

const ClickSchema = new Schema<ClickDocument>({
    linkId: { type: Schema.Types.ObjectId, ref: 'Link', required: true },
    userId: { type: String, ref: 'User', required: true },
    country: { type: String, required: true },
    timestamp: { type: Date, default: () => new Date(), index: true },
    userAgent: { type: String },
    deviceType: { type: String, enum: ['mobile', 'desktop', 'tablet', 'unknown'], default: 'unknown', index: true },
    source: { type: String, default: 'default', index: true },
});

// Índice compuesto para búsquedas rápidas por link y fecha
ClickSchema.index({ linkId: 1, timestamp: -1 });

export default mongoose.models.Click || mongoose.model<ClickDocument>('Click', ClickSchema);
