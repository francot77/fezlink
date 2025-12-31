// models/analyticsMonthly.ts
import mongoose from 'mongoose';

const AnalyticsMonthlySchema = new mongoose.Schema({
    linkId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },

    month: {
        type: String, // YYYY-MM
        required: true,
    },

    totalClicks: {
        type: Number,
        default: 0,
        min: 0,
    },

    byCountry: {
        type: Map,
        of: Number,
        default: () => new Map(),
    },

    bySource: {
        type: Map,
        of: Number,
        default: () => new Map(),
    },

    byDevice: {
        type: Map,
        of: Number,
        default: () => new Map(),
    },

}, {
    timestamps: true,
});

// Índice único: 1 doc por link + mes
AnalyticsMonthlySchema.index(
    { linkId: 1, month: 1 },
    {
        unique: true,
        name: 'linkId_month_unique',
    }
);

// Índice para queries tipo "últimos 12 meses"
AnalyticsMonthlySchema.index(
    { linkId: 1, month: -1 },
    { name: 'linkId_month_desc_idx' }
);

export default mongoose.models.AnalyticsMonthly
    || mongoose.model('AnalyticsMonthly', AnalyticsMonthlySchema);
