// types/insights.types.ts
// Interfaces compartidas entre backend, worker y frontend

export type InsightPeriod = '7d' | '30d' | '90d' | 'yearly';

export type InsightStatus = 'pending' | 'calculating' | 'completed' | 'error';

export type InsightType = 'critical' | 'warning' | 'opportunity' | 'positive' | 'info';

export type InsightCategory =
  | 'traffic'
  | 'geography'
  | 'performance'
  | 'temporal'
  | 'device'
  | 'source';

export interface InsightSignal {
  key: string;
  type: InsightType;
  category: InsightCategory;
  priority: number;
  metricValue: number;
  metricDelta?: number;
  relatedIds?: string[];
  chartData?: number[];
  metadata?: Record<string, unknown>;
}

export interface AggregatedMetrics {
  userId: string;
  period: InsightPeriod;
  startDate: string;
  endDate: string;
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
  topLinksByClicks: Array<{ linkId: string; clicks: number; slug: string }>;
  topCountries: Array<{ country: string; clicks: number }>;
  topSources: Array<{ source: string; clicks: number }>;
  topDevices: Array<{ device: string; clicks: number }>;
  dailyClicks: Array<{ date: string; clicks: number }>;
  clicksByDayOfWeek: Array<{ day: number; clicks: number }>;
  previousPeriod?: {
    totalClicks: number;
    totalLinks: number;
  };
}

export interface InsightsResult {
  userId: string;
  period: InsightPeriod;
  version: string;
  inputsHash: string;
  totalLinks: number;
  totalClicks: number;
  insights: InsightSignal[];
  calculatedAt: Date;
  expiresAt: Date;
}

export interface WorkerConfig {
  batchSize: number;
  maxRetries: number;
  timeoutMs: number;
  minDataPoints: number;
  trendThresholdPercent: number;
}

export interface UserProcessingResult {
  userId: string;
  success: boolean;
  insightsGenerated: number;
  duration: number;
  error?: string;
}
