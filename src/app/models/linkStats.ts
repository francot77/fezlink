import mongoose from 'mongoose';

const countryStatsSchema = new mongoose.Schema({
    country: { type: String, required: true }, // Ej: "AR", "ES"
    clicksCount: { type: Number, default: 0 }
}, { _id: false }); // Evita crear _id por cada subdocumento

const linkStatsSchema = new mongoose.Schema({
    linkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
    countries: [countryStatsSchema]
});

linkStatsSchema.index({ linkId: 1 });

const LinkStats = mongoose.models.LinkStats || mongoose.model('LinkStats', linkStatsSchema);
export { LinkStats };
