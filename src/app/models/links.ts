// models/links.ts
import mongoose from 'mongoose';

const LinkSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true // CRÍTICO para "mis links"
    },

    destinationUrl: {
        type: String,
        required: true,
        alias: 'originalUrl',
        maxlength: 2048 // validación
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        alias: 'shortId',
        lowercase: true, // normalizar
        trim: true
    },

    totalClicks: {
        type: Number,
        default: 0,
        min: 0 // validación
    },

    // Útil para soft-delete
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    byCountry: {
        type: Map,
        of: Number,
        default: {}
    }

}, {
    timestamps: true
});

// Índice compuesto para "mis links ordenados por fecha"
LinkSchema.index(
    { userId: 1, createdAt: -1 },
    { name: 'userId_created_desc' }
);

// Índice compuesto para "mis links activos"
LinkSchema.index(
    { userId: 1, isActive: 1, createdAt: -1 },
    {
        name: 'userId_active_created',
        partialFilterExpression: { isActive: true } // solo indexar activos
    }
);

// Índice para búsqueda por slug (ya está con unique: true)
// LinkSchema.index({ slug: 1 }); // ❌ redundante

const Link = mongoose.models.Link || mongoose.model('Link', LinkSchema);

export { Link };