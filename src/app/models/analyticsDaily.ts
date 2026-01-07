// models/analyticsDaily.ts
import mongoose from 'mongoose';

const AnalyticsDailySchema = new mongoose.Schema(
  {
    linkId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // ❌ NO poner index aquí, ya está en compound index
    },

    date: {
      type: String, // YYYY-MM-DD (correcto, más eficiente que Date)
      required: true,
      // ❌ NO poner index aquí, ya está en compound index
    },

    totalClicks: {
      type: Number,
      default: 0,
      min: 0, // validación
    },

    // Map es perfecto para datos dinámicos
    byCountry: {
      type: Map,
      of: Number,
      default: () => new Map(), // factory function
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
  },
  {
    timestamps: true, // útil saber cuándo se actualizó
  }
);

// ⚡ ÚNICO índice necesario (compound + unique)
AnalyticsDailySchema.index(
  { linkId: 1, date: 1 },
  {
    unique: true,
    name: 'linkId_date_unique',
  }
);

// Índice adicional para queries "dame stats de últimos 30 días"
AnalyticsDailySchema.index({ date: -1 }, { name: 'date_desc_idx' });

// Índice para queries "stats de este link últimos 30 días"
AnalyticsDailySchema.index({ linkId: 1, date: -1 }, { name: 'linkId_date_desc_idx' });

export default mongoose.models.AnalyticsDaily ||
  mongoose.model('AnalyticsDaily', AnalyticsDailySchema);
