import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { deleteLinkForUser } from '@/core/links/service';
import { verify2FAIfEnabled } from '@/lib/2fa-helper';
import rateLimit from '@/lib/rate-limit';
import { withErrorHandler, AppError } from '@/lib/error-handler';
import { logger, SecurityEvents } from '@/lib/logger';
import { getClientIp } from '@/lib/get-client-ip';

// Rate limiter: 30 delete actions per minute
const deleteLinkLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

async function deleteLinkHandler(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { userId } = await requireAuth();
    const { id } = await context.params;

    // 1. Rate Limiting
    try {
        await deleteLinkLimiter.check(req, 30);
    } catch {
        logger.security(SecurityEvents.RATE_LIMIT_EXCEEDED, {
            userId,
            endpoint: `/api/links/${id}`,
            method: 'DELETE',
            ip: getClientIp(req),
        });
        throw new AppError(429, 'Rate limit exceeded. Please try again later.');
    }

    // 2. Check 2FA
    const twoFactorCode = req.headers.get('x-2fa-code') || undefined;
    const twoFactorCheck = await verify2FAIfEnabled(userId, twoFactorCode);

    if (!twoFactorCheck.ok) {
        if (twoFactorCheck.error === '2FA_REQUIRED') {
            throw new AppError(403, '2FA_REQUIRED');
        }
        if (twoFactorCheck.error === 'INVALID_2FA') {
            throw new AppError(403, 'INVALID_2FA');
        }
    }

    // 3. Delete Action
    const result = await deleteLinkForUser(userId, id);
    
    if (!result.ok) {
        if (result.reason === 'not_found') {
            throw new AppError(404, 'Link not found');
        }
        if (result.reason === 'unauthorized') {
             logger.security(SecurityEvents.UNAUTHORIZED_ACCESS, {
                userId,
                resourceId: id,
                action: 'delete_link',
                ip: getClientIp(req)
             });
             throw new AppError(401, 'Unauthorized');
        }
        throw new AppError(500, 'Failed to delete link');
    }

    logger.info('Link deleted successfully', { userId, linkId: id });

    return NextResponse.json({ success: true });
}

export const DELETE = withErrorHandler(deleteLinkHandler);
