// lib/emitAnalyticsEvent.ts
//import { AnalyticsEvent } from '@/app/models/analyticsEvents';
import { publishEvent } from '@/lib/rabbitmq';

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
  context?: string; // e.g. 'biopage'
  deviceType: DeviceType;

  userAgent?: string;
}

export async function emitAnalyticsEvent(event: ClickEvent) {
  try {
    // 1. Legacy: MongoDB Direct Write (DISABLED for performance)
    // await AnalyticsEvent.create(event);

    // 2. New: RabbitMQ Publish
    if (event.type === 'click') {
      const published = await publishEvent('event.click', event);
      if (!published) {
        console.warn('[emitAnalyticsEvent] ⚠️ Failed to publish to RabbitMQ');
      }
    }
  } catch (err) {
    console.error('[AnalyticsEvent] ❌ Error:', err);
  }
}
