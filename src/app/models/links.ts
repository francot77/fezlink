import mongoose from 'mongoose';

const LinkSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    destinationUrl: { type: String, required: true, alias: 'originalUrl' },
    slug: { type: String, required: true, unique: true, alias: 'shortId' },
    totalClicks: { type: Number, default: 0 }
}, { timestamps: true });

// Verifica si el modelo ya está definido, y si no, lo define
const Link = mongoose.models.Link || mongoose.model('Link', LinkSchema);

export { Link };
