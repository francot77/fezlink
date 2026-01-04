/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/insights/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';

import { authOptions } from '@/lib/auth-options';
import type { InsightPeriod } from '@/types/insights.types';
import insightsCache from '@/app/models/insightsCache';

const CURRENT_VERSION = 'v2';

function getTTLHours(period: InsightPeriod): number {
    switch (period) {
        case '7d': return 4;
        case '30d': return 12;
        case '90d': return 24;
        case 'yearly': return 48;
    }
}

/**
 * GET /api/insights?period=30d
 * Retorna insights cached o crea entrada pending
 */
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Autenticación
        const userId = await getUserIdFromRequest(request);

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Validar parámetros
        const searchParams = request.nextUrl.searchParams;
        const period = searchParams.get('period') as InsightPeriod;
        const forceRefresh = searchParams.get('forceRefresh') === 'true';

        if (!period || !['7d', '30d', '90d', 'yearly'].includes(period)) {
            return NextResponse.json(
                { error: 'Invalid period. Use: 7d, 30d, 90d, yearly' },
                { status: 400 }
            );
        }

        // Si forceRefresh, eliminar cache existente
        if (forceRefresh) {
            await insightsCache.deleteOne({
                userId,
                period,
                version: CURRENT_VERSION
            });
        }

        // Buscar cache válido existente
        let cache = await insightsCache.findOne({
            userId,
            period,
            version: CURRENT_VERSION,
            expiresAt: { $gt: new Date() }
        }).lean();

        let created = false;

        // Si no existe, crear nuevo cache pending
        if (!cache) {
            console.log("ASDASDASD")
            const ttlHours = getTTLHours(period);
            const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

            try {
                const newCache = await insightsCache.create({
                    userId,
                    period,
                    version: CURRENT_VERSION,
                    inputsHash: 'pending',
                    status: 'pending',
                    totalLinks: 0,
                    totalClicks: 0,
                    insights: [],
                    startDate: null,
                    endDate: null,
                    expiresAt
                });

                cache = newCache.toObject();
                created = true;

                console.log('[API] Created pending cache:', {
                    userId,
                    period,
                    cacheId: newCache._id
                });

            } catch (error: any) {
                // Race condition: otro request creó el cache
                if (error.code === 11000) {
                    console.log('[API] Race condition detected, fetching existing cache');
                    cache = await insightsCache.findOne({
                        userId,
                        period,
                        version: CURRENT_VERSION
                    }).lean();

                    if (!cache) {
                        throw new Error('Cache not found after race condition');
                    }
                } else {
                    throw error;
                }
            }
        }

        // Construir response según status
        const response = buildResponse(cache, created);

        return NextResponse.json(response);

    } catch (error: any) {
        console.error('[API] Error fetching insights:', {
            message: error.message,
            stack: error.stack
        });

        return NextResponse.json(
            {
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

/**
 * Construye response basado en estado del cache
 */
function buildResponse(cache: any, created: boolean) {
    switch (cache.status) {
        case 'completed':
            return {
                status: 'completed',
                data: {
                    userId: cache.userId,
                    period: cache.period,
                    version: cache.version,
                    inputsHash: cache.inputsHash,
                    totalLinks: cache.totalLinks,
                    totalClicks: cache.totalClicks,
                    insights: cache.insights,
                    calculatedAt: cache.calculatedAt,
                    expiresAt: cache.expiresAt
                }
            };

        case 'calculating':
            return {
                status: 'calculating',
                estimatedWaitTime: 10,
                message: 'Insights are being calculated. Please wait...'
            };

        case 'pending':
            return {
                status: 'pending',
                estimatedWaitTime: created ? 30 : 15,
                message: 'Insights calculation queued. Worker will process soon.'
            };

        case 'error':
            return {
                status: 'error',
                error: cache.error || 'Unknown error occurred',
                message: 'Failed to generate insights. Please try again later.'
            };

        default:
            return {
                status: 'error',
                error: 'Invalid cache state',
                message: 'Unknown status: ' + cache.status
            };
    }
}

/**
 * Obtiene userId desde la request
 */
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
    try {
        const session = await getServerSession(authOptions);
        return session?.user?.id || null;
    } catch (error) {
        console.error('[API] Error getting session:', error);
        return null;
    }
}

/**
 * DELETE /api/insights?period=30d
 * Invalida cache (force refresh)
 */
export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();

        const userId = await getUserIdFromRequest(request);

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const period = searchParams.get('period') as InsightPeriod;

        if (!period || !['7d', '30d', '90d', 'yearly'].includes(period)) {
            return NextResponse.json(
                { error: 'Invalid period' },
                { status: 400 }
            );
        }

        const result = await insightsCache.deleteOne({
            userId,
            period,
            version: CURRENT_VERSION
        });

        console.log('[API] Deleted cache:', {
            userId,
            period,
            deletedCount: result.deletedCount
        });

        return NextResponse.json({
            success: true,
            message: 'Cache invalidated successfully',
            deletedCount: result.deletedCount
        });

    } catch (error: any) {
        console.error('[API] Error invalidating cache:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}