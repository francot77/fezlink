import mongoose, { Document } from 'mongoose';

export type InsightStatus = 'pending' | 'calculating' | 'completed' | 'error';

export interface InsightSignal {
  key: string; // identificador estable del insight
  type: 'critical' | 'warning' | 'opportunity' | 'positive' | 'info';
  category: 'traffic' | 'geography' | 'performance' | 'temporal' | 'device' | 'source';
  priority: number;

  // datos puros (no copy)
  metricValue: number;
  metricDelta?: number;
  relatedIds?: string[]; // linkIds, country codes, etc.

  // datos para visualización
  chartData?: number[];
  metadata?: Record<string, unknown>;
}

export interface InsightsCacheDocument extends Document {
  userId: string;
  period: '7d' | '30d' | '90d' | 'yearly';

  startDate: string;
  endDate: string;

  version: string; // ej: "v2"
  inputsHash: string; // hash de métricas base

  status: InsightStatus;
  error?: string;

  totalLinks: number;
  totalClicks: number;

  insights: InsightSignal[];

  createdAt: Date;
  updatedAt: Date;
  calculatedAt?: Date;
  expiresAt: Date;
}

const InsightsCache = new mongoose.Schema<InsightsCacheDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    period: {
      type: String,
      enum: ['7d', '30d', '90d', 'yearly'],
      required: true,
    },

    startDate: { type: String, required: false },
    endDate: { type: String, required: false },

    version: {
      type: String,
      required: true,
      default: 'v2',
    },

    inputsHash: {
      type: String,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['pending', 'calculating', 'completed', 'error'],
      required: true,
      default: 'pending',
      index: true,
    },

    error: String,

    totalLinks: { type: Number, default: 0 },
    totalClicks: { type: Number, default: 0 },

    insights: [
      {
        key: { type: String, required: true },
        type: { type: String, required: true },
        category: { type: String, required: true },
        priority: { type: Number, required: true },

        metricValue: Number,
        metricDelta: Number,

        relatedIds: [String],
        chartData: [Number],
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],

    calculatedAt: Date,

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Un solo cache por user + period + version
InsightsCache.index({ userId: 1, period: 1, version: 1 }, { unique: true });

// TTL real controlado por documento
InsightsCache.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.InsightsCache ||
  mongoose.model<InsightsCacheDocument>('InsightsCache', InsightsCache);
