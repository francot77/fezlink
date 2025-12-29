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
        index: true,
    }
}, { timestamps: false });

const AnalyticsEvent = mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
export { AnalyticsEvent }
