/* eslint-disable @typescript-eslint/no-unused-vars */
// worker/logic/insights.generator.ts

import type { AggregatedMetrics, InsightSignal, WorkerConfig } from '../../types/insights.types';
import crypto from 'crypto';

export function generateInsights(
  metrics: AggregatedMetrics,
  config: WorkerConfig
): InsightSignal[] {
  const insights: InsightSignal[] = [];

  if (metrics.totalClicks < config.minDataPoints) {
    return [];
  }

  insights.push(...analyzeTrafficTrends(metrics, config));
  insights.push(...analyzeGeography(metrics, config));
  insights.push(...analyzePerformance(metrics, config));
  insights.push(...analyzeTemporalPatterns(metrics, config));
  insights.push(...analyzeDistributions(metrics, config));

  insights.sort((a, b) => b.priority - a.priority);
  return insights;
}

/* ───────────────────────── TRAFFIC ───────────────────────── */

function analyzeTrafficTrends(metrics: AggregatedMetrics, config: WorkerConfig): InsightSignal[] {
  const insights: InsightSignal[] = [];

  if (!metrics.previousPeriod || metrics.previousPeriod.totalClicks === 0) {
    return insights;
  }

  const delta =
    ((metrics.totalClicks - metrics.previousPeriod.totalClicks) /
      metrics.previousPeriod.totalClicks) *
    100;

  if (delta >= config.trendThresholdPercent) {
    insights.push({
      key: 'traffic_growth',
      type: 'positive',
      category: 'traffic',
      priority: 90,
      metricValue: metrics.totalClicks,
      metricDelta: delta,
      chartData: metrics.dailyClicks.map((d) => d.clicks),
      metadata: { period: metrics.period },
    });
  } else if (delta <= -config.trendThresholdPercent) {
    insights.push({
      key: 'traffic_decline',
      type: 'warning',
      category: 'traffic',
      priority: 95,
      metricValue: metrics.totalClicks,
      metricDelta: delta,
      chartData: metrics.dailyClicks.map((d) => d.clicks),
      metadata: { period: metrics.period },
    });
  }

  const avgDaily = metrics.totalClicks / metrics.dailyClicks.length;
  const spike = metrics.dailyClicks.find((d) => d.clicks > avgDaily * 2);

  if (spike && avgDaily > 10) {
    insights.push({
      key: 'traffic_spike',
      type: 'positive', // ← ojo: opportunity la podés mapear por metadata
      category: 'traffic',
      priority: 80,
      metricValue: spike.clicks,
      metricDelta: ((spike.clicks - avgDaily) / avgDaily) * 100,
      metadata: {
        date: spike.date,
        avgDaily,
      },
    });
  }

  return insights;
}

/* ───────────────────────── GEOGRAPHY ───────────────────────── */

function analyzeGeography(metrics: AggregatedMetrics, _config: WorkerConfig): InsightSignal[] {
  const insights: InsightSignal[] = [];
  if (metrics.topCountries.length === 0) return insights;

  const total = metrics.topCountries.reduce((s, c) => s + c.clicks, 0);
  const top = metrics.topCountries[0];
  const percent = (top.clicks / total) * 100;

  if (percent > 50) {
    insights.push({
      key: 'geo_concentration',
      type: 'info',
      category: 'geography',
      priority: 60,
      metricValue: percent,
      relatedIds: [top.country],
      metadata: {
        country: top.country,
        clicks: top.clicks,
      },
    });
  }

  const significant = metrics.topCountries.filter((c) => c.clicks / total > 0.05);

  if (significant.length >= 5) {
    insights.push({
      key: 'geo_diversification',
      type: 'positive',
      category: 'geography',
      priority: 70,
      metricValue: significant.length,
      relatedIds: significant.map((c) => c.country),
    });
  }

  if (metrics.topCountries.length >= 2) {
    const second = metrics.topCountries[1];
    const secondPercent = (second.clicks / total) * 100;

    if (secondPercent > 20) {
      insights.push({
        key: 'geo_emerging',
        type: 'positive',
        category: 'geography',
        priority: 75,
        metricValue: secondPercent,
        relatedIds: [second.country],
        metadata: {
          country: second.country,
          clicks: second.clicks,
        },
      });
    }
  }

  return insights;
}

/* ───────────────────────── PERFORMANCE ───────────────────────── */

function analyzePerformance(metrics: AggregatedMetrics, _config: WorkerConfig): InsightSignal[] {
  const insights: InsightSignal[] = [];
  if (metrics.totalLinks === 0) return insights;

  const engagementRate = metrics.totalClicks / metrics.activeLinks;

  if (engagementRate > 100) {
    insights.push({
      key: 'performance_high_engagement',
      type: 'positive',
      category: 'performance',
      priority: 85,
      metricValue: engagementRate,
      metadata: {
        activeLinks: metrics.activeLinks,
        avgClicksPerLink: Math.round(engagementRate),
      },
    });
  }

  if (engagementRate < 5 && metrics.activeLinks > 3) {
    insights.push({
      key: 'performance_low_engagement',
      type: 'warning',
      category: 'performance',
      priority: 85,
      metricValue: engagementRate,
      metadata: {
        activeLinks: metrics.activeLinks,
        suggestion: 'consider_link_optimization',
      },
    });
  }

  if (metrics.topLinksByClicks.length > 0) {
    const top = metrics.topLinksByClicks[0];
    const percent = (top.clicks / metrics.totalClicks) * 100;

    if (percent > 40) {
      insights.push({
        key: 'performance_top_link',
        type: 'info',
        category: 'performance',
        priority: 65,
        metricValue: percent,
        relatedIds: [top.linkId],
        metadata: {
          slug: top.slug,
          clicks: top.clicks,
        },
      });
    }
  }

  return insights;
}

/* ───────────────────────── TEMPORAL ───────────────────────── */

function analyzeTemporalPatterns(
  metrics: AggregatedMetrics,
  _config: WorkerConfig
): InsightSignal[] {
  const insights: InsightSignal[] = [];
  if (metrics.clicksByDayOfWeek.length === 0) return insights;

  const total = metrics.clicksByDayOfWeek.reduce((s, d) => s + d.clicks, 0);
  if (total < 50) return insights;

  const peak = metrics.clicksByDayOfWeek.reduce((a, b) => (b.clicks > a.clicks ? b : a));

  const percent = (peak.clicks / total) * 100;
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (percent > 25) {
    insights.push({
      key: 'temporal_peak_day',
      type: 'positive',
      category: 'temporal',
      priority: 70,
      metricValue: percent,
      metadata: {
        dayOfWeek: dayNames[peak.day],
        clicks: peak.clicks,
      },
    });
  }

  const weekday = metrics.clicksByDayOfWeek.filter((d) => d.day >= 1 && d.day <= 5);
  const weekend = metrics.clicksByDayOfWeek.filter((d) => d.day === 0 || d.day === 6);

  const weekdayAvg = weekday.reduce((s, d) => s + d.clicks, 0) / 5;
  const weekendAvg = weekend.reduce((s, d) => s + d.clicks, 0) / 2;

  if (weekendAvg > weekdayAvg * 1.5) {
    insights.push({
      key: 'temporal_weekend_peak',
      type: 'info',
      category: 'temporal',
      priority: 65,
      metricValue: (weekendAvg / weekdayAvg - 1) * 100,
      metadata: {
        weekendAvg: Math.round(weekendAvg),
        weekdayAvg: Math.round(weekdayAvg),
      },
    });
  } else if (weekdayAvg > weekendAvg * 1.5) {
    insights.push({
      key: 'temporal_weekday_peak',
      type: 'info',
      category: 'temporal',
      priority: 65,
      metricValue: (weekdayAvg / weekendAvg - 1) * 100,
      metadata: {
        weekendAvg: Math.round(weekendAvg),
        weekdayAvg: Math.round(weekdayAvg),
      },
    });
  }

  return insights;
}

/* ───────────────────────── DISTRIBUTIONS ───────────────────────── */

function analyzeDistributions(metrics: AggregatedMetrics, _config: WorkerConfig): InsightSignal[] {
  const insights: InsightSignal[] = [];

  if (metrics.topDevices.length > 0) {
    const total = metrics.topDevices.reduce((s, d) => s + d.clicks, 0);
    const top = metrics.topDevices[0];
    const percent = (top.clicks / total) * 100;

    if (percent > 70) {
      insights.push({
        key: 'device_dominance',
        type: 'info',
        category: 'device',
        priority: 55,
        metricValue: percent,
        metadata: {
          device: top.device,
          clicks: top.clicks,
        },
      });
    }
  }

  if (metrics.topSources.length > 0) {
    const total = metrics.topSources.reduce((s, d) => s + d.clicks, 0);
    const top = metrics.topSources[0];
    const percent = (top.clicks / total) * 100;

    if (percent > 60) {
      insights.push({
        key: 'source_concentration',
        type: 'info',
        category: 'source',
        priority: 60,
        metricValue: percent,
        metadata: {
          source: top.source,
          clicks: top.clicks,
        },
      });
    }

    const significant = metrics.topSources.filter((s) => s.clicks / total > 0.1);

    if (significant.length >= 3) {
      insights.push({
        key: 'source_diversification',
        type: 'positive',
        category: 'source',
        priority: 65,
        metricValue: significant.length,
        relatedIds: significant.map((s) => s.source),
      });
    }
  }

  return insights;
}

/* ───────────────────────── HASH ───────────────────────── */

export function calculateInputsHash(metrics: AggregatedMetrics): string {
  const hashData = {
    totalClicks: metrics.totalClicks,
    totalLinks: metrics.totalLinks,
    activeLinks: metrics.activeLinks,
    topCountries: metrics.topCountries.slice(0, 3).map((c) => ({ c: c.country, v: c.clicks })),
    topLinks: metrics.topLinksByClicks.slice(0, 3).map((l) => l.clicks),
    previousClicks: metrics.previousPeriod?.totalClicks || 0,
    dailyBins:
      metrics.dailyClicks.length > 0
        ? binTimeSeries(
            metrics.dailyClicks.map((d) => d.clicks),
            7
          )
        : [],
  };

  return crypto
    .createHash('sha256')
    .update(JSON.stringify(hashData))
    .digest('hex')
    .substring(0, 16);
}

function binTimeSeries(values: number[], bins: number): number[] {
  if (values.length <= bins) return values;

  const size = Math.ceil(values.length / bins);
  const result: number[] = [];

  for (let i = 0; i < values.length; i += size) {
    const bin = values.slice(i, i + size);
    result.push(Math.round(bin.reduce((s, v) => s + v, 0) / bin.length));
  }

  return result;
}
