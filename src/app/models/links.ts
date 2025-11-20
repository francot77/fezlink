import mongoose, { type Document, type Model } from 'mongoose';

interface LinkDocument extends Document {
    userId: string;
    destinationUrl: string;
    shortId: string;
    slug: string;
    totalClicks: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const LinkSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    destinationUrl: { type: String, required: true, alias: 'originalUrl' },
    // Persist the value under `shortId` to match the existing unique index name
    // while still allowing the rest of the codebase to use the `slug` alias.
    shortId: { type: String, required: true, unique: true, alias: 'slug' },
    totalClicks: { type: Number, default: 0 }
}, { timestamps: true });

// Verifica si el modelo ya está definido, y si no, lo define
const Link = (mongoose.models.Link as Model<LinkDocument>) || mongoose.model<LinkDocument>('Link', LinkSchema);

export { Link, type LinkDocument };
