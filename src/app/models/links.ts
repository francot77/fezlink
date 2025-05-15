import mongoose from 'mongoose';

const LinkSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    originalUrl: { type: String, required: true },
    shortId: { type: String, required: true, unique: true },
    totalClicks: { type: Number, default: 0 }
});

// Verifica si el modelo ya está definido, y si no, lo define
const Link = mongoose.models.Link || mongoose.model('Link', LinkSchema);

export { Link };


