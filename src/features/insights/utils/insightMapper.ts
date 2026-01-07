/* eslint-disable @typescript-eslint/no-explicit-any */
// components/insights/insightMapper.ts
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Globe,
  Calendar,
  Layers,
  Target,
  Smartphone,
  Link2,
  MapPin,
  Activity,
  Zap,
} from 'lucide-react';

export function mapInsight(raw: any, t: any) {
  const baseInsight = {
    id: raw._id || raw.key,
    type: raw.type,
    category: raw.category,
    priority: raw.priority,
    metricValue: raw.metricValue,
    metricDelta: raw.metricDelta,
    chartData: raw.chartData,
    metadata: raw.metadata,
    relatedIds: raw.relatedIds,
  };

  // Traffic insights
  if (raw.key.includes('traffic_growth')) {
    return {
      ...baseInsight,
      icon: TrendingUp,
      title: t('types.traffic_growth.title'),
      description: t('types.traffic_growth.description', { delta: Math.abs(raw.metricDelta || 0).toFixed(1) }),
      detail: t('types.traffic_growth.detail', { value: raw.metricValue.toLocaleString() }),
      metricUnit: 'count',
    };
  }

  if (raw.key.includes('traffic_decline')) {
    return {
      ...baseInsight,
      icon: TrendingDown,
      title: t('types.traffic_decline.title'),
      description: t('types.traffic_decline.description', { delta: Math.abs(raw.metricDelta || 0).toFixed(1) }),
      detail: t('types.traffic_decline.detail', { value: raw.metricValue.toLocaleString() }),
      metricUnit: 'count',
    };
  }

  if (raw.key.includes('traffic_spike')) {
    const date = raw.metadata?.date || 'Desconocida';
    return {
      ...baseInsight,
      icon: Zap,
      title: t('types.traffic_spike.title'),
      description: t('types.traffic_spike.description', { value: raw.metricValue.toLocaleString() }),
      detail: t('types.traffic_spike.detail', { date, delta: Math.abs(raw.metricDelta || 0).toFixed(1) }),
      metricUnit: 'count',
    };
  }

  // Geography insights
  if (raw.key.includes('geo_concentration')) {
    const country = raw.metadata?.country || 'desconocido';
    return {
      ...baseInsight,
      icon: MapPin,
      title: t('types.geo_concentration.title'),
      description: t('types.geo_concentration.description', { value: raw.metricValue.toFixed(0), country }),
      detail: t('types.geo_concentration.detail', { country }),
      metricUnit: 'percent',
    };
  }

  if (raw.key.includes('geo_diversification')) {
    return {
      ...baseInsight,
      icon: Globe,
      title: t('types.geo_diversification.title'),
      description: t('types.geo_diversification.description', { value: raw.metricValue }),
      detail: t('types.geo_diversification.detail'),
      metricUnit: 'count',
    };
  }

  if (raw.key.includes('geo_emerging')) {
    const country = raw.metadata?.country || 'desconocido';
    return {
      ...baseInsight,
      icon: Globe,
      title: t('types.geo_emerging.title'),
      description: t('types.geo_emerging.description', { country, value: raw.metricValue.toFixed(0) }),
      detail: t('types.geo_emerging.detail', { country }),
      metricUnit: 'percent',
    };
  }

  // Performance insights
  if (raw.key.includes('performance_high_engagement')) {
    const avgClicks = raw.metadata?.avgClicksPerLink || 0;
    return {
      ...baseInsight,
      icon: Target,
      title: t('types.performance_high_engagement.title'),
      description: t('types.performance_high_engagement.description', { value: Math.round(raw.metricValue) }),
      detail: t('types.performance_high_engagement.detail', { avgClicks }),
      metricUnit: 'count',
    };
  }

  if (raw.key.includes('performance_low_engagement')) {
    const activeLinks = raw.metadata?.activeLinks || 0;
    return {
      ...baseInsight,
      icon: AlertTriangle,
      title: t('types.performance_low_engagement.title'),
      description: t('types.performance_low_engagement.description', { value: raw.metricValue.toFixed(1) }),
      detail: t('types.performance_low_engagement.detail', { activeLinks }),
      metricUnit: 'count',
    };
  }

  if (raw.key.includes('performance_top_link')) {
    const slug = raw.metadata?.slug || 'link';
    const clicks = raw.metadata?.clicks || 0;
    return {
      ...baseInsight,
      icon: Link2,
      title: t('types.performance_top_link.title'),
      description: t('types.performance_top_link.description', { slug, value: raw.metricValue.toFixed(0) }),
      detail: t('types.performance_top_link.detail', { clicks: clicks.toLocaleString() }),
      metricUnit: 'percent',
    };
  }

  // Temporal insights
  if (raw.key.includes('temporal_peak_day')) {
    const dayName = raw.metadata?.dayOfWeek || 'Desconocido';
    return {
      ...baseInsight,
      icon: Calendar,
      title: t('types.temporal_peak_day.title'),
      description: t('types.temporal_peak_day.description', { dayName, value: raw.metricValue.toFixed(0) }),
      detail: t('types.temporal_peak_day.detail', { dayName }),
      metricUnit: 'percent',
    };
  }

  if (raw.key.includes('temporal_weekend_peak')) {
    const weekendAvg = raw.metadata?.weekendAvg || 0;
    const weekdayAvg = raw.metadata?.weekdayAvg || 0;
    return {
      ...baseInsight,
      icon: Calendar,
      title: t('types.temporal_weekend_peak.title'),
      description: t('types.temporal_weekend_peak.description', { value: raw.metricValue.toFixed(0) }),
      detail: t('types.temporal_weekend_peak.detail', { weekendAvg: weekendAvg.toLocaleString(), weekdayAvg: weekdayAvg.toLocaleString() }),
      metricUnit: 'percent',
    };
  }

  if (raw.key.includes('temporal_weekday_peak')) {
    const weekdayAvg = raw.metadata?.weekdayAvg || 0;
    const weekendAvg = raw.metadata?.weekendAvg || 0;
    return {
      ...baseInsight,
      icon: Calendar,
      title: t('types.temporal_weekday_peak.title'),
      description: t('types.temporal_weekday_peak.description', { value: raw.metricValue.toFixed(0) }),
      detail: t('types.temporal_weekday_peak.detail', { weekdayAvg: weekdayAvg.toLocaleString(), weekendAvg: weekendAvg.toLocaleString() }),
      metricUnit: 'percent',
    };
  }

  // Device insights
  if (raw.key.includes('device_dominance')) {
    const device = raw.metadata?.device || 'desconocido';
    return {
      ...baseInsight,
      icon: Smartphone,
      title: t('types.device_dominance.title'),
      description: t('types.device_dominance.description', { value: raw.metricValue.toFixed(0), device }),
      detail: t('types.device_dominance.detail', { device }),
      metricUnit: 'percent',
    };
  }

  // Source insights
  if (raw.key.includes('source_concentration')) {
    const source = raw.metadata?.source || 'desconocida';
    return {
      ...baseInsight,
      icon: Activity,
      title: t('types.source_concentration.title'),
      description: t('types.source_concentration.description', { value: raw.metricValue.toFixed(0), source }),
      detail: t('types.source_concentration.detail', { source }),
      metricUnit: 'percent',
    };
  }

  if (raw.key.includes('source_diversification')) {
    return {
      ...baseInsight,
      icon: Layers,
      title: t('types.source_diversification.title'),
      description: t('types.source_diversification.description', { value: raw.metricValue }),
      detail: t('types.source_diversification.detail'),
      metricUnit: 'count',
    };
  }

  // Fallback genérico
  return {
    ...baseInsight,
    icon: AlertTriangle,
    title: t('types.generic.title'),
    description: t('types.generic.description', { category: raw.category }),
    detail: t('types.generic.detail', { value: raw.metricValue }),
    metricUnit: 'count',
  };
}
