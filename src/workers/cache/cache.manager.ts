/* eslint-disable @typescript-eslint/no-explicit-any */
// worker/cache/cache.manager.ts
// Cache layer: operaciones de cache con MongoDB
// Maneja estados, TTL y detección de cambios
import type { InsightPeriod, InsightStatus, InsightsResult } from '../../types/insights.types';
import insightsCache from '@/app/models/insightsCache';

const CURRENT_VERSION = 'v2';

/**
 * Calcula TTL dinámico basado en período
 * Períodos más cortos → cachés más cortos
 */
function getTTLHours(period: InsightPeriod): number {
  switch (period) {
    case '7d':
      return 4; // 4 horas
    case '30d':
      return 12; // 12 horas
    case '90d':
      return 24; // 24 horas
    case 'yearly':
      return 48; // 48 horas
  }
}

/**
 * Obtiene cache existente o crea uno nuevo en estado pending
 * Retorna el documento y un flag indicando si fue creado
 */
export async function getOrCreateCache(
  userId: string,
  period: InsightPeriod
): Promise<{ cache: any; created: boolean }> {
  // Buscar cache válido existente
  let cache = await insightsCache.findOne({
    userId,
    period,
    version: CURRENT_VERSION,
    status: { $in: ['completed', 'calculating', 'pending'] },
    expiresAt: { $gt: new Date() },
  });

  if (cache) {
    return { cache, created: false };
  }

  // Crear nuevo cache en estado pending
  const ttlHours = getTTLHours(period);
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  try {
    cache = await insightsCache.create({
      userId,
      period,
      version: CURRENT_VERSION,
      inputsHash: '', // se calculará en el worker
      status: 'pending',
      totalLinks: 0,
      totalClicks: 0,
      insights: [],
      expiresAt,
    });

    return { cache, created: true };
  } catch (error: any) {
    // Manejo de race condition (unique index violation)
    if (error.code === 11000) {
      cache = await insightsCache.findOne({
        userId,
        period,
        version: CURRENT_VERSION,
      });

      if (cache) {
        return { cache, created: false };
      }
    }

    throw error;
  }
}

/**
 * Encuentra cachés en estado pending que necesitan procesamiento
 */
export async function findPendingCaches(limit: number) {
  return await insightsCache
    .find({
      status: 'pending',
      version: CURRENT_VERSION,
      expiresAt: { $gt: new Date() },
    })
    .sort({ createdAt: 1 }) // FIFO
    .limit(limit)
    .lean();
}

/**
 * Marca cache como "calculating" para evitar procesamiento duplicado
 * Usa atomic update para evitar race conditions
 */
export async function markAsCalculating(userId: string, period: InsightPeriod): Promise<boolean> {
  const result = await insightsCache.updateOne(
    {
      userId,
      period,
      version: CURRENT_VERSION,
      status: 'pending',
    },
    {
      $set: {
        status: 'calculating',
        updatedAt: new Date(),
      },
    }
  );

  return result.modifiedCount > 0;
}

/**
 * Verifica si los insights deben recalcularse comparando inputsHash
 */
export async function shouldRecalculate(
  userId: string,
  period: InsightPeriod,
  newInputsHash: string
): Promise<boolean> {
  const cache = await insightsCache.findOne({
    userId,
    period,
    version: CURRENT_VERSION,
  });

  if (!cache) return true;

  // Si no hay hash previo, recalcular
  if (!cache.inputsHash) return true;

  // Si el hash cambió, recalcular
  if (cache.inputsHash !== newInputsHash) return true;

  // Si está expirado, recalcular
  if (cache.expiresAt < new Date()) return true;

  // Si está en error, recalcular
  if (cache.status === 'error') return true;

  return false;
}

/**
 * Guarda resultado de insights en cache
 */
export async function saveInsightsResult(result: InsightsResult): Promise<void> {
  await insightsCache.updateOne(
    {
      userId: result.userId,
      period: result.period,
      version: result.version,
    },
    {
      $set: {
        inputsHash: result.inputsHash,
        status: 'completed',
        totalLinks: result.totalLinks,
        totalClicks: result.totalClicks,
        insights: result.insights,
        calculatedAt: result.calculatedAt,
        expiresAt: result.expiresAt,
        error: null,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

/**
 * Marca cache como error
 */
export async function markAsError(
  userId: string,
  period: InsightPeriod,
  error: string
): Promise<void> {
  // En caso de error, expirar en 1 hora para retry
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await insightsCache.updateOne(
    {
      userId,
      period,
      version: CURRENT_VERSION,
    },
    {
      $set: {
        status: 'error',
        error,
        expiresAt,
        updatedAt: new Date(),
      },
    }
  );
}

/**
 * Limpia cachés expirados manualmente (opcional, TTL index lo hace automáticamente)
 */
export async function cleanExpiredCaches(): Promise<number> {
  const result = await insightsCache.deleteMany({
    expiresAt: { $lt: new Date() },
  });

  return result.deletedCount || 0;
}

/**
 * Obtiene estadísticas del cache (útil para monitoring)
 */
export async function getCacheStats() {
  const stats = await insightsCache.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const result: Record<InsightStatus, number> = {
    pending: 0,
    calculating: 0,
    completed: 0,
    error: 0,
  };

  for (const stat of stats) {
    result[stat._id as InsightStatus] = stat.count;
  }

  return result;
}

/**
 * Invalida cache de un usuario (útil para force refresh)
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  await insightsCache.deleteMany({
    userId,
    version: CURRENT_VERSION,
  });
}
