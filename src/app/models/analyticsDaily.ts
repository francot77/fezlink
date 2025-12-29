// models/analyticsDaily.ts
import mongoose from 'mongoose';

const AnalyticsDailySchema = new mongoose.Schema({
    linkId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
    },

    date: {
        type: String, // YYYY-MM-DD
        required: true,
        index: true,
    },

    totalClicks: {
        type: Number,
        default: 0,
    },

    byCountry: {
        type: Map,
        of: Number,
        default: {},
    },

    bySource: {
        type: Map,
        of: Number,
        default: {},
    },

    byDevice: {
        type: Map,
        of: Number,
        default: {},
    },
}, {
    timestamps: false,
});

AnalyticsDailySchema.index({ linkId: 1, date: 1 }, { unique: true });

export default mongoose.models.AnalyticsDaily
    || mongoose.model('AnalyticsDaily', AnalyticsDailySchema);
