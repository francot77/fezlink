// lib/emitAnalyticsEvent.ts
import { AnalyticsEvent } from '@/app/models/analyticsEvents';

export interface BaseEvent {
  id?: string;
  type: string;
  timestamp: Date;
}

export type DeviceType = 'mobile' | 'desktop' | 'tablet' | 'unknown';

export interface ClickEvent extends BaseEvent {
  type: 'click';

  linkId: string;
  userId: string;

  country: string;
  source: string;
  deviceType: DeviceType;

  userAgent?: string;
}

export async function emitAnalyticsEvent(event: ClickEvent) {
  try {
    console.log('[emitAnalyticsEvent]', event);
    await AnalyticsEvent.create(event);
  } catch (err) {
    console.error('[AnalyticsEvent]', err);
  }
}
