import mongoose from 'mongoose';

const countryStatsSchema = new mongoose.Schema({
    country: { type: String, required: true }, // Ej: "AR", "ES"
    clicksCount: { type: Number, default: 0 }
}, { _id: false }); // Evita crear _id por cada subdocumento

const sourceStatsSchema = new mongoose.Schema({
    source: { type: String, required: true },
    clicksCount: { type: Number, default: 0 }
}, { _id: false });

const linkStatsSchema = new mongoose.Schema({
    linkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
    countries: [countryStatsSchema],
    sources: [sourceStatsSchema]
});

linkStatsSchema.index({ linkId: 1 });
linkStatsSchema.index({ linkId: 1, 'sources.source': 1 });

const LinkStats = mongoose.models.LinkStats || mongoose.model('LinkStats', linkStatsSchema);
export { LinkStats };
