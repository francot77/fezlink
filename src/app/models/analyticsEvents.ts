// models/analyticsEvent.ts
import mongoose from 'mongoose';

const AnalyticsEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['click'], // validación
      default: 'click',
    },

    linkId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true, // para queries por link
    },

    userId: {
      type: String,
      required: true,
      index: true, // para queries por usuario
    },

    // Defaults para evitar null en agregación
    country: {
      type: String,
      default: 'unknown',
    },

    source: {
      type: String,
      default: 'direct',
    },

    deviceType: {
      type: String,
      default: 'unknown',
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true, // para ordenar FIFO
    },

    // Para worker concurrente
    processedAt: {
      type: Date,
      default: null,
    },

    processingStartedAt: {
      type: Date,
      default: null,
    },

    workerId: {
      type: String,
      default: null,
    },

    // TTL para auto-eliminación (eventos procesados)
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 }, // expira cuando llegue a esta fecha
    },
  },
  {
    timestamps: true, // útil para debugging
  }
);

// ⚡ ÍNDICE CRÍTICO para el worker (orden importa)
AnalyticsEventSchema.index(
  {
    type: 1,
    processedAt: 1,
    processingStartedAt: 1,
    timestamp: 1, // para FIFO
  },
  {
    name: 'worker_processing_idx',
    partialFilterExpression: {
      // solo indexar eventos no procesados
      processedAt: null,
    },
  }
);

// Índice para queries por link específico
AnalyticsEventSchema.index({ linkId: 1, timestamp: -1 });

// Índice para queries por usuario
AnalyticsEventSchema.index({ userId: 1, timestamp: -1 });

// Middleware: cuando se marca como procesado, setear expiresAt
AnalyticsEventSchema.pre('updateMany', function (next) {
  const update = this.getUpdate() as { $set?: { processedAt?: Date; expiresAt?: Date } };
  if (update.$set?.processedAt) {
    update.$set.expiresAt = new Date(Date.now() + 2 * 1000); // 7 * 24 * 60 * 60 * 1000 // 7 días
  }
  next();
});

const AnalyticsEvent =
  mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema);

export { AnalyticsEvent };
