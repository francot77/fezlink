import { NextResponse, NextRequest } from 'next/server';
import { detectDeviceType, detectSource, getCountryCode } from '@/core/redirects/resolver';
import { ClickEvent, emitAnalyticsEvent } from '@/lib/emitAnalyticsEvent';
import { withRateLimit } from '@/lib/middleware/withRateLimit';

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const { linkId, userId } = body;

    if (!linkId || !userId) {
      return NextResponse.json({ error: 'Missing linkId or userId' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const referer = req.headers.get('referer') || req.headers.get('referrer');
    const userAgent = req.headers.get('user-agent');

    // Permitir source personalizado desde el cliente, o detectarlo
    const source = body.source || detectSource(searchParams, referer, userAgent);
    const country = getCountryCode(req);
    const deviceType = detectDeviceType(userAgent, req.headers);

    const clickEvent: ClickEvent = {
      type: 'click',
      linkId,
      userId,
      country,
      source,
      deviceType,
      userAgent: userAgent ?? undefined,
      timestamp: new Date(),
    };

    // Registrar el evento esperando la confirmación (garantía de registro)
    await emitAnalyticsEvent(clickEvent);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Aplicar Rate Limit: 20 peticiones cada 60 segundos por IP
// Esto permite un uso normal pero bloquea ataques masivos
export const POST = withRateLimit(handler, {
  limit: 5,
  interval: 60 * 1000, // 60 segundos
});