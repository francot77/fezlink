// workers/insightsWorker.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from '@/lib/mongodb';
import InsightsCache from '@/app/models/insightsCache';

import type {
    InsightPeriod,
    WorkerConfig
} from '@/types/insights.types';
import { aggregateMetricsForUser } from './data/metrics.aggregator';
import { calculateInputsHash, generateInsights } from './logic/insights.generator';

const DEFAULT_CONFIG: WorkerConfig = {
    batchSize: 50,
    maxRetries: 3,
    timeoutMs: 30000,
    minDataPoints: 10,
    trendThresholdPercent: 15
};

const CURRENT_VERSION = 'v2';

function getTTLMs(period: InsightPeriod): number {
    switch (period) {
        case '7d': return 4 * 60 * 60 * 1000;
        case '30d': return 12 * 60 * 60 * 1000;
        case '90d': return 24 * 60 * 60 * 1000;
        case 'yearly': return 48 * 60 * 60 * 1000;
    }
}

export async function runInsightsWorker(
    config: Partial<WorkerConfig> = {}
): Promise<{ processed: number; successful: number; failed: number }> {
    await dbConnect();

    const workerConfig: WorkerConfig = { ...DEFAULT_CONFIG, ...config };
    const startTime = Date.now();

    console.log('[InsightsWorker] Starting...', {
        batchSize: workerConfig.batchSize,
        timestamp: new Date().toISOString()
    });

    // Encontrar cachés pending
    const pendingCaches = await InsightsCache.find({
        status: 'pending',
        version: CURRENT_VERSION,
        expiresAt: { $gt: new Date() }
    })
        .sort({ createdAt: 1 })
        .limit(workerConfig.batchSize)
        .lean();

    console.log(`[InsightsWorker] Found ${pendingCaches.length} pending caches`);

    if (pendingCaches.length === 0) {
        return { processed: 0, successful: 0, failed: 0 };
    }

    let successful = 0;
    let failed = 0;

    // Procesar en batches de 5 concurrentes
    for (let i = 0; i < pendingCaches.length; i += 5) {
        const batch = pendingCaches.slice(i, i + 5);

        const results = await Promise.allSettled(
            batch.map(cache =>
                processUserInsights(cache.userId, cache.period, workerConfig)
            )
        );

        for (const result of results) {
            if (result.status === 'fulfilled' && result.value.success) {
                successful++;
            } else {
                failed++;
            }
        }
    }

    const duration = Date.now() - startTime;
    console.log('[InsightsWorker] Completed', {
        processed: pendingCaches.length,
        successful,
        failed,
        duration: `${duration}ms`
    });

    return { processed: pendingCaches.length, successful, failed };
}

async function processUserInsights(
    userId: string,
    period: InsightPeriod,
    config: WorkerConfig
): Promise<{ success: boolean; error?: string }> {
    const startTime = Date.now();

    try {
        // 1. Marcar como calculating (atomic)
        const marked = await InsightsCache.updateOne(
            {
                userId,
                period,
                version: CURRENT_VERSION,
                status: 'pending'
            },
            {
                $set: {
                    status: 'calculating',
                    updatedAt: new Date()
                }
            }
        );

        if (marked.modifiedCount === 0) {
            return { success: false, error: 'Already being processed' };
        }

        // 2. Agregar métricas
        const metrics = await Promise.race([
            aggregateMetricsForUser(userId, period),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), config.timeoutMs)
            )
        ]);

        // 3. Calcular inputsHash
        const inputsHash = calculateInputsHash(metrics);

        // 4. Verificar si necesita recalcular
        const existingCache = await InsightsCache.findOne({
            userId,
            period,
            version: CURRENT_VERSION
        });

        const needsRecalc = !existingCache ||
            !existingCache.inputsHash ||
            existingCache.inputsHash !== inputsHash;

        if (!needsRecalc) {
            // Solo actualizar status y expiresAt
            await InsightsCache.updateOne(
                { userId, period, version: CURRENT_VERSION },
                {
                    $set: {
                        status: 'completed',
                        expiresAt: new Date(Date.now() + getTTLMs(period)),
                        updatedAt: new Date()
                    }
                }
            );

            console.log(`[InsightsWorker] Skipped ${userId} (no changes)`);
            return { success: true };
        }

        // 5. Generar insights
        const insights = generateInsights(metrics, config);

        // 6. Guardar resultado
        await InsightsCache.updateOne(
            { userId, period, version: CURRENT_VERSION },
            {
                $set: {
                    inputsHash,
                    status: 'completed',
                    totalLinks: metrics.totalLinks,
                    totalClicks: metrics.totalClicks,
                    insights,
                    calculatedAt: new Date(),
                    expiresAt: new Date(Date.now() + getTTLMs(period)),
                    error: null,
                    updatedAt: new Date()
                }
            }
        );

        const duration = Date.now() - startTime;
        console.log(`[InsightsWorker] Success ${userId} - ${insights.length} insights (${duration}ms)`);

        return { success: true };

    } catch (error: any) {
        console.error(`[InsightsWorker] Error processing ${userId}:`, error);

        // Marcar como error
        await InsightsCache.updateOne(
            { userId, period, version: CURRENT_VERSION },
            {
                $set: {
                    status: 'error',
                    error: error.message || 'Unknown error',
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h para retry
                    updatedAt: new Date()
                }
            }
        );

        return { success: false, error: error.message };
    }
}

export async function getSystemStatus() {
    await dbConnect();

    const stats = await InsightsCache.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    const result: Record<string, number> = {
        pending: 0,
        calculating: 0,
        completed: 0,
        error: 0
    };

    for (const stat of stats) {
        result[stat._id] = stat.count;
    }

    return {
        timestamp: new Date().toISOString(),
        cache: result,
        version: CURRENT_VERSION
    };
}

export async function cleanExpiredCaches(): Promise<number> {
    await dbConnect();

    const result = await InsightsCache.deleteMany({
        expiresAt: { $lt: new Date() }
    });

    return result.deletedCount || 0;
}