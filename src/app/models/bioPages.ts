import mongoose, { Schema, Document } from 'mongoose';

interface IBiopage extends Document {
    userId: string;
    links: { shortUrl: string; label: string }[]; // ID del link y nombre visible
    slug: string;
    backgroundColor: string;
    textColor: string;
    avatarUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const biopageSchema = new Schema<IBiopage>(
    {
        userId: { type: String, required: true },
        links: [{
            shortUrl: { type: String, required: true },
            shortId: { type: String, required: true },
            label: { type: String, default: "" }
        }],
        slug: { type: String, unique: true, required: true },
        backgroundColor: { type: String, default: "#000000" },
        textColor: { type: String, default: "#ffffff" },
        avatarUrl: { type: String, default: "" },
    },
    { timestamps: true }
);

const Biopage = mongoose.models.Biopage || mongoose.model<IBiopage>('Biopage', biopageSchema);
export default Biopage;
