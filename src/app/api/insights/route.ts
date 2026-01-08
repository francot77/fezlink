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
    case '7d':
      return 4;
    case '30d':
      return 12;
    case '90d':
      return 24;
    case 'yearly':
      return 48;
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Buscar cache válido existente (incluso si está expirado, para verificar last calculation)
    let cache: any = await insightsCache
      .findOne({
        userId,
        period,
        version: CURRENT_VERSION,
      })
      .lean();

    let limitReached = false;
    let nextUpdateAt: Date | null = null;

    // Si forceRefresh, verificar límite de tiempo (24h)
    if (forceRefresh && cache?.status === 'completed' && cache.calculatedAt) {
      const lastCalculation = new Date(cache.calculatedAt).getTime();
      const oneDayInMs = 24 * 60 * 60 * 1000;
      const timeSinceCalculation = Date.now() - lastCalculation;

      if (timeSinceCalculation < oneDayInMs) {
        // Bloquear refresh
        console.log('[API] Daily limit reached for insights calculation', { userId });
        limitReached = true;
        nextUpdateAt = new Date(lastCalculation + oneDayInMs);
      } else {
        // Permitir refresh -> Eliminar cache
        await insightsCache.deleteOne({ _id: cache._id });
        cache = null; // Resetear cache para forzar regeneración
      }
    } else if (forceRefresh) {
      // Si no hay cache o no está completado, permitir borrar cualquier residuo
      await insightsCache.deleteOne({
        userId,
        period,
        version: CURRENT_VERSION,
      });
      cache = null;
    }

    // Si no forzamos refresh (o fue bloqueado), y el cache existente ya expiró (por TTL de MongoDB o lógica),
    // normalmente MongoDB lo borraría por TTL index, pero si lo encontramos aquí es que existe.
    // Sin embargo, mi query original filtraba por expiresAt > now.
    // Debemos asegurar que si usamos el cache encontrado arriba, sea válido en tiempo de expiración normal
    // A MENOS que hayamos bloqueado el refresh, en cuyo caso preferimos devolver el cache viejo que nada.

    // Recuperar cache válido si no lo tenemos (caso normal sin forceRefresh)
    if (!cache) {
      cache = await insightsCache
        .findOne({
          userId,
          period,
          version: CURRENT_VERSION,
          expiresAt: { $gt: new Date() },
        })
        .lean();
    }

    // Si aún así no hay cache (o estaba expirado y no se bloqueó refresh), crear uno nuevo
    let created = false;

    // ... (resto del código de creación)

    // Si no existe, crear nuevo cache pending
    if (!cache) {
      console.log('ASDASDASD');
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
          expiresAt,
        });

        cache = newCache.toObject();
        created = true;

        console.log('[API] Created pending cache:', {
          userId,
          period,
          cacheId: newCache._id,
        });
      } catch (error: any) {
        // Race condition: otro request creó el cache
        if (error.code === 11000) {
          console.log('[API] Race condition detected, fetching existing cache');
          cache = await insightsCache
            .findOne({
              userId,
              period,
              version: CURRENT_VERSION,
            })
            .lean();

          if (!cache) {
            throw new Error('Cache not found after race condition');
          }
        } else {
          throw error;
        }
      }
    }

    // Construir response según status
    const response = buildResponse(cache, created, { limitReached, nextUpdateAt });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[API] Error fetching insights:', {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Construye response basado en estado del cache
 */
function buildResponse(
  cache: any,
  created: boolean,
  meta?: { limitReached?: boolean; nextUpdateAt?: Date | null }
) {
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
          expiresAt: cache.expiresAt,
        },
        meta: meta || {},
      };

    case 'calculating':
      return {
        status: 'calculating',
        estimatedWaitTime: 10,
        message: 'Insights are being calculated. Please wait...',
      };

    case 'pending':
      return {
        status: 'pending',
        estimatedWaitTime: created ? 30 : 15,
        message: 'Insights calculation queued. Worker will process soon.',
      };

    case 'error':
      return {
        status: 'error',
        error: cache.error || 'Unknown error occurred',
        message: 'Failed to generate insights. Please try again later.',
      };

    default:
      return {
        status: 'error',
        error: 'Invalid cache state',
        message: 'Unknown status: ' + cache.status,
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') as InsightPeriod;

    if (!period || !['7d', '30d', '90d', 'yearly'].includes(period)) {
      return NextResponse.json({ error: 'Invalid period' }, { status: 400 });
    }

    const result = await insightsCache.deleteOne({
      userId,
      period,
      version: CURRENT_VERSION,
    });

    console.log('[API] Deleted cache:', {
      userId,
      period,
      deletedCount: result.deletedCount,
    });

    return NextResponse.json({
      success: true,
      message: 'Cache invalidated successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error('[API] Error invalidating cache:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
