// models/analyticsEvent.ts
import mongoose from 'mongoose';

const AnalyticsEventSchema = new mongoose.Schema({
    type: { type: String, required: true }, // "click"
    linkId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userId: { type: String, required: true },
    country: String,
    source: String,
    deviceType: String,
    timestamp: { type: Date, default: Date.now },
    processedAt: {
        type: Date,
        default: null,
        index: { expireAfterSeconds: 60 * 60 * 24 * 7 }// 7 Dias
    }
}, { timestamps: false });

const AnalyticsEvent = mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
export { AnalyticsEvent }
