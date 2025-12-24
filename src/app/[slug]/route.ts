import { Link } from '@/app/models/links';
import { LinkStats } from '../models/linkStats';
import Click from '../models/clicks';
import GlobalClicks from '../models/globalClicks';
import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';

type DeviceType = 'mobile' | 'desktop' | 'tablet' | 'unknown';

interface RequestWithHeaders extends Request {
    headers: Headers;
}

function getCountryCode(req: RequestWithHeaders): string {
    return req.headers.get('x-vercel-ip-country') || 'UNKNOWN';
}

function detectDeviceType(userAgent: string | null, headers: Headers): DeviceType {
    const hintedType = headers.get('x-device-type')?.toLowerCase();
    if (hintedType === 'mobile' || hintedType === 'tablet' || hintedType === 'desktop') {
        return hintedType;
    }

    const chUaMobile = headers.get('sec-ch-ua-mobile');
    if (chUaMobile === '?1') return 'mobile';
    if (chUaMobile === '?0') return 'desktop';

    if (!userAgent) return 'unknown';

    const ua = userAgent.toLowerCase();
    if (/(ipad|tablet|android(?!.*mobile))/i.test(ua)) return 'tablet';
    if (/(mobile|iphone|android)/i.test(ua)) return 'mobile';

    return 'desktop';
}

// ✅ NUEVA FUNCIÓN: Detectar source inteligentemente
function detectSource(searchParams: URLSearchParams, referer: string | null, userAgent: string | null): string {
    // 1. Primero chequear el parámetro explícito (prioridad máxima)
    const explicitSrc = searchParams.get('src') || searchParams.get('source') || searchParams.get('utm_source');
    if (explicitSrc) {
        return explicitSrc.toLowerCase().replace(/[^\w-]/g, '_');
    }

    // 2. Detectar desde referer
    if (referer) {
        const refLower = referer.toLowerCase();

        // Instagram
        if (refLower.includes('instagram.com') || refLower.includes('l.instagram.com')) {
            return 'instagram_bio';
        }

        // WhatsApp
        if (refLower.includes('whatsapp.com') || refLower.includes('wa.me')) {
            return 'whatsapp';
        }

        // Facebook
        if (refLower.includes('facebook.com') || refLower.includes('fb.com') || refLower.includes('m.facebook.com')) {
            return 'facebook';
        }

        // Twitter/X
        if (refLower.includes('twitter.com') || refLower.includes('t.co') || refLower.includes('x.com')) {
            return 'twitter';
        }

        // LinkedIn
        if (refLower.includes('linkedin.com') || refLower.includes('lnkd.in')) {
            return 'linkedin';
        }

        // TikTok
        if (refLower.includes('tiktok.com')) {
            return 'tiktok';
        }

        // YouTube
        if (refLower.includes('youtube.com') || refLower.includes('youtu.be')) {
            return 'youtube';
        }

        // Telegram
        if (refLower.includes('telegram.org') || refLower.includes('t.me')) {
            return 'telegram';
        }

        // Email clients
        if (refLower.includes('mail.google.com') || refLower.includes('outlook.') || refLower.includes('mail.yahoo.com')) {
            return 'email';
        }

        // Si viene de otro dominio, marcar como referral
        try {
            const refUrl = new URL(referer);
            if (refUrl.hostname !== new URL(process.env.BASE_URL || '').hostname) {
                return 'referral';
            }
        } catch {
            // ignore
        }
    }

    // 3. Detectar QR desde user agent (algunos QR scanners se identifican)
    if (userAgent) {
        const uaLower = userAgent.toLowerCase();
        if (uaLower.includes('qr') || uaLower.includes('scanner')) {
            return 'qr_scan';
        }
    }

    // 4. Default
    return 'direct';
}

function sanitize(slug: string) {
    if (slug.startsWith('@')) return '@' + slug.replace(/[^\w-]/g, '');
    return slug.replace(/[^\w-]/g, '');
}

function cacheableRedirect(url: string, status = 301) {
    const res = NextResponse.redirect(url, status);
    res.headers.set('Cache-Control', 'public, max-age=3600');
    return res;
}

export async function GET(req: Request, context: { params: Promise<{ slug?: string }> }) {
    const startTime = Date.now();

    const { slug } = await context.params;
    const sanitizedSlug = slug ? sanitize(slug) : '';

    if (!sanitizedSlug) return cacheableRedirect(`${process.env.BASE_URL}/404`);
    if (sanitizedSlug.startsWith('@')) {
        return cacheableRedirect(`${process.env.BASE_URL}/bio/${sanitizedSlug.slice(1)}`);
    }

    const { searchParams } = new URL(req.url);
    const referer = req.headers.get('referer') || req.headers.get('referrer');
    const userAgent = req.headers.get('user-agent');

    // ✅ DETECTAR SOURCE INTELIGENTEMENTE
    const source = detectSource(searchParams, referer, userAgent);

    const country = getCountryCode(req as RequestWithHeaders);
    const deviceType = detectDeviceType(userAgent, req.headers);

    await dbConnect();

    const updatedLink = await Link.findOneAndUpdate(
        { slug: sanitizedSlug },
        { $inc: { totalClicks: 1 } },
        { new: true }
    );

    if (!updatedLink) return cacheableRedirect(`${process.env.BASE_URL}/404`);

    // ⬇⬇⬇ MÉTRICAS DESACOPLADAS CON MEJOR LOGGING ⬇⬇⬇
    const metricsTask = async () => {
        const metricsStartTime = Date.now();

        try {
            // 1. Update LinkStats
            const res = await LinkStats.updateOne(
                { linkId: updatedLink._id, 'countries.country': country },
                { $inc: { 'countries.$.clicksCount': 1 } }
            );

            if (res.modifiedCount === 0) {
                await LinkStats.updateOne(
                    { linkId: updatedLink._id },
                    {
                        $setOnInsert: { linkId: updatedLink._id },
                        $push: { countries: { country, clicksCount: 1 } },
                    },
                    { upsert: true }
                );
            }

            // 2. Update Global Clicks
            await GlobalClicks.findOneAndUpdate(
                {},
                { $inc: { count: 1 } },
                { upsert: true }
            );

            // 3. Create Click record
            await Click.create({
                linkId: updatedLink._id,
                userId: updatedLink.userId,
                country,
                timestamp: new Date(),
                userAgent,
                deviceType,
                source,
            });

            const metricsTime = Date.now() - metricsStartTime;

            // ✅ Log solo si es lento (> 500ms) o en desarrollo
            if (metricsTime > 500 || process.env.NODE_ENV === 'development') {
                console.log(`[Metrics] ${sanitizedSlug} | source: ${source} | device: ${deviceType} | country: ${country} | ${metricsTime}ms`);
            }

        } catch (err) {
            // ✅ LOGGING MEJORADO: Ahora sabrás qué clicks fallan
            console.error(`[Metrics Error] ${sanitizedSlug} |`, {
                error: err instanceof Error ? err.message : String(err),
                source,
                deviceType,
                country,
                linkId: updatedLink._id.toString(),
                timestamp: new Date().toISOString(),
            });
        }
    };

    // Node runtime (Vercel)
    if ('waitUntil' in globalThis) {
        // @ts-expect-error Vercel waitUntil
        globalThis.waitUntil(metricsTask());
    } else {
        // En desarrollo, ejecutar inmediatamente para ver errores
        if (process.env.NODE_ENV === 'development') {
            await metricsTask();
        } else {
            metricsTask(); // fallback producción
        }
    }

    const totalTime = Date.now() - startTime;

    // ✅ Log de redirección (solo si es lenta)
    if (totalTime > 200) {
        console.log(`[Redirect] ${sanitizedSlug} → ${updatedLink.destinationUrl} | ${totalTime}ms`);
    }

    return cacheableRedirect(updatedLink.destinationUrl, 301);
}