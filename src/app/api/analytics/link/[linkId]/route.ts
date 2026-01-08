/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/analytics/link/[linkId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AnalyticsDaily from '@/app/models/analyticsDaily';
import AnalyticsMonthly from '@/app/models/analyticsMonthly';
import { Link } from '@/app/models/links';
import { requireAuth, isPremiumActive } from '@/lib/auth-helpers';
import { isValidObjectId } from '@/core/utils/validation';
import { logger, logRequest, SecurityEvents } from '@/lib/logger';
import { withErrorHandler, AppError } from '@/lib/error-handler';
import { withRateLimit } from '@/lib/middleware/withRateLimit';
import { z } from 'zod';

interface Trend {
  key: string;
  thisPeriod: number;
  lastPeriod: number;
  changePercent: number | null;
  hasEnoughData: boolean;
}

// ✅ Schema de validación para query params
const analyticsQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  device: z.string().optional(),
  source: z.string().optional(),
  country: z
    .string()
    .regex(/^[A-Z]{2}$/, 'Country must be 2-letter code')
    .optional(),
});

function sumMap(target: Record<string, number>, source?: Record<string, number>) {
  if (!source) return;
  for (const [key, value] of Object.entries(source)) {
    target[key] = (target[key] ?? 0) + value;
  }
}

function buildTrends(
  currentRows: any[],
  previousRows: any[],
  field: 'byDevice' | 'bySource'
): Trend[] {
  const sum = (rows: any[]) => {
    const acc: Record<string, number> = {};
    for (const r of rows) {
      const data = r[field];
      const dataObj = data instanceof Map ? Object.fromEntries(data) : data || {};

      for (const [k, v] of Object.entries(dataObj)) {
        acc[k] = (acc[k] ?? 0) + (v as number);
      }
    }
    return acc;
  };

  const current = sum(currentRows);
  const previous = sum(previousRows);

  const keys = new Set([...Object.keys(current), ...Object.keys(previous)]);

  return [...keys].map((key) => {
    const thisPeriod = current[key] ?? 0;
    const lastPeriod = previous[key] ?? 0;

    const hasEnoughData = thisPeriod > 0 || lastPeriod > 0;

    let changePercent: number | null = null;
    if (lastPeriod > 0) {
      changePercent = Math.round(((thisPeriod - lastPeriod) / lastPeriod) * 100);
    }

    return {
      key,
      thisPeriod,
      lastPeriod,
      changePercent,
      hasEnoughData,
    };
  });
}

function shouldUseMonthlyData(from: string, to: string): boolean {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const diffMs = toDate.getTime() - fromDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays > 60;
}

function filterData(data: any[], filters: { device?: string; source?: string; country?: string }) {
  if (!filters.device && !filters.source && !filters.country) {
    return data;
  }

  return data.map((row) => {
    const newRow = { ...row };

    if (filters.device && newRow.byDevice) {
      const deviceObj =
        newRow.byDevice instanceof Map ? Object.fromEntries(newRow.byDevice) : newRow.byDevice;
      const filteredDevice: Record<string, number> = {};

      if (deviceObj[filters.device]) {
        filteredDevice[filters.device] = deviceObj[filters.device];
      }
      newRow.byDevice = filteredDevice;
      newRow.totalClicks = filteredDevice[filters.device] || 0;
    }

    if (filters.source && newRow.bySource) {
      const sourceObj =
        newRow.bySource instanceof Map ? Object.fromEntries(newRow.bySource) : newRow.bySource;
      const filteredSource: Record<string, number> = {};

      if (sourceObj[filters.source]) {
        filteredSource[filters.source] = sourceObj[filters.source];
      }
      newRow.bySource = filteredSource;
      if (!filters.device) {
        newRow.totalClicks = filteredSource[filters.source] || 0;
      } else {
        newRow.totalClicks = Math.min(newRow.totalClicks, filteredSource[filters.source] || 0);
      }
    }

    if (filters.country && newRow.byCountry) {
      const countryObj =
        newRow.byCountry instanceof Map ? Object.fromEntries(newRow.byCountry) : newRow.byCountry;
      const filteredCountry: Record<string, number> = {};

      if (countryObj[filters.country]) {
        filteredCountry[filters.country] = countryObj[filters.country];
      }
      newRow.byCountry = filteredCountry;
      if (!filters.device && !filters.source) {
        newRow.totalClicks = filteredCountry[filters.country] || 0;
      } else {
        const countryClicks = filteredCountry[filters.country] || 0;
        newRow.totalClicks = Math.min(newRow.totalClicks, countryClicks);
      }
    }

    return newRow;
  });
}

function getPreviousPeriod(from: string, to: string, useMonthly: boolean) {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (useMonthly) {
    const prevTo = new Date(fromDate);
    prevTo.setMonth(prevTo.getMonth() - 1);

    const prevFrom = new Date(prevTo);
    const diffMs = toDate.getTime() - fromDate.getTime();
    prevFrom.setTime(prevFrom.getTime() - diffMs);

    return {
      prevFrom: prevFrom.toISOString().slice(0, 10),
      prevTo: prevTo.toISOString().slice(0, 10),
    };
  } else {
    const diffMs = toDate.getTime() - fromDate.getTime();
    const prevTo = new Date(fromDate.getTime() - 1);
    const prevFrom = new Date(prevTo.getTime() - diffMs);

    return {
      prevFrom: prevFrom.toISOString().slice(0, 10),
      prevTo: prevTo.toISOString().slice(0, 10),
    };
  }
}

async function getAnalyticsHandler(
  req: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  // ✅ 1. Autenticación obligatoria
  const { userId, session } = await requireAuth();

  // ✅ 2. Log del request
  await logRequest(req, userId);

  await dbConnect();

  const { linkId } = await params;

  // ✅ 3. Validar que linkId es un ObjectId válido
  if (!isValidObjectId(linkId)) {
    logger.security(SecurityEvents.INJECTION_ATTEMPT, {
      userId,
      linkId,
      reason: 'Invalid ObjectId format',
    });
    throw new AppError(400, 'Invalid link ID');
  }

  // ✅ 4. Validar query parameters con Zod
  const { searchParams } = new URL(req.url);

  let validatedParams;
  try {
    validatedParams = analyticsQuerySchema.parse({
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      device: searchParams.get('device') || undefined,
      source: searchParams.get('source') || undefined,
      country: searchParams.get('country') || undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(400, error.message);
    }
    throw new AppError(400, 'Invalid query parameters');
  }

  const { from, to, device, source, country } = validatedParams;

  // ✅ RESTRICCIÓN PLAN FREE: Máximo 7 días de historia
  let finalFrom = from;
  if (!isPremiumActive(session)) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const limitDateStr = sevenDaysAgo.toISOString().slice(0, 10);

    if (finalFrom < limitDateStr) {
      finalFrom = limitDateStr;
    }
  }

  // ✅ 5. Validar rango de fechas
  const fromDate = new Date(finalFrom);
  const toDate = new Date(to);

  if (fromDate > toDate) {
    // Si al ajustar la fecha, from > to, significa que el usuario pidió datos muy antiguos.
    // En este caso, devolvemos datos vacíos o ajustamos to también, o lanzamos error.
    // Para ser amigables, si es free y pidió algo viejo, le damos los últimos 7 días por defecto o error.
    // Si ajustamos finalFrom y quedó mayor a to, es porque to también era viejo.
    throw new AppError(403, 'Free plan is limited to last 7 days of analytics');
  }

  const daysDiff = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff > 365) {
    throw new AppError(400, 'Date range cannot exceed 365 days');
  }

  // ✅ 6. Verificar que el link pertenece al usuario autenticado
  const link = await Link.findOne({
    _id: linkId,
    userId,
  }).select('totalClicks');

  if (!link) {
    // ✅ Log de intento de acceso no autorizado
    logger.security(SecurityEvents.UNAUTHORIZED_ACCESS, {
      userId,
      linkId,
      action: 'view_analytics',
    });
    throw new AppError(404, 'Link not found');
  }

  // ✅ 7. Procesar analytics (código existente)
  // Usuarios Free nunca usan mensual porque solo ven 7 días
  const useMonthly = isPremiumActive(session) && shouldUseMonthlyData(finalFrom, to);
  const AnalyticsModel = useMonthly ? AnalyticsMonthly : AnalyticsDaily;
  const dateField = useMonthly ? 'month' : 'date';

  const formatForModel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (useMonthly) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    }
    return dateStr;
  };

  const formattedFrom = formatForModel(finalFrom);
  const formattedTo = formatForModel(to);

  const currentRows = await AnalyticsModel.find({
    linkId,
    [dateField]: { $gte: formattedFrom, $lte: formattedTo },
  }).lean();

  const filters = {
    device: device || undefined,
    source: source || undefined,
    country: country || undefined,
  };

  const filteredCurrentRows = filterData(currentRows, filters);

  const { prevFrom, prevTo } = getPreviousPeriod(finalFrom, to, useMonthly);
  const prevFormattedFrom = formatForModel(prevFrom);
  const prevFormattedTo = formatForModel(prevTo);

  const previousRows = await AnalyticsModel.find({
    linkId,
    [dateField]: { $gte: prevFormattedFrom, $lte: prevFormattedTo },
  }).lean();

  const filteredPreviousRows = filterData(previousRows, filters);

  const convertMapToObject = (mapData: any) => {
    if (!mapData) return {};
    if (mapData instanceof Map) {
      return Object.fromEntries(mapData);
    }
    return mapData;
  };

  const daily: { date: string; clicks: number }[] = [];
  const byCountry: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const byDevice: Record<string, number> = {};

  for (const row of filteredCurrentRows) {
    const rowClicks = row.totalClicks ?? 0;
    if (rowClicks > 0 || (!device && !source && !country)) {
      daily.push({
        date: row[dateField],
        clicks: rowClicks,
      });
    }

    sumMap(byCountry, convertMapToObject(row.byCountry));
    sumMap(bySource, convertMapToObject(row.bySource));
    sumMap(byDevice, convertMapToObject(row.byDevice));
  }

  daily.sort((a, b) => a.date.localeCompare(b.date));

  const deviceTrends = buildTrends(filteredCurrentRows, filteredPreviousRows, 'byDevice');

  const sourceTrends = buildTrends(filteredCurrentRows, filteredPreviousRows, 'bySource');

  // ✅ 8. Log de acceso exitoso
  logger.info('Analytics retrieved successfully', {
    userId,
    linkId,
    from: finalFrom,
    to,
    hasFilters: !!(device || source || country),
  });

  return NextResponse.json({
    totalClicks: link.totalClicks ?? 0,
    daily,
    byCountry,
    bySource,
    byDevice,
    trends: {
      byDevice: deviceTrends,
      bySource: sourceTrends,
    },
    filters: {
      device,
      source,
      country,
    },
    metadata: {
      frequency: useMonthly ? 'monthly' : 'daily',
      dateField,
    },
  });
}

// ✅ Exportar con rate limiting y error handling
export const GET = withRateLimit(withErrorHandler(getAnalyticsHandler), {
  limit: 30, // 30 requests
  interval: 60000, // por minuto
});
