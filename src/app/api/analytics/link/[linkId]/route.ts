/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AnalyticsDaily from '@/app/models/analyticsDaily';
import { Link } from '@/app/models/links';

interface Trend {
    key: string;
    thisPeriod: number;
    lastPeriod: number;
    changePercent: number | null;
    hasEnoughData: boolean;
}

function sumMap(
    target: Record<string, number>,
    source?: Record<string, number>
) {
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
            for (const [k, v] of Object.entries(r[field] || {})) {
                acc[k] = (acc[k] ?? 0) + (v as number);
            }
        }
        return acc;
    };

    const current = sum(currentRows);
    const previous = sum(previousRows);

    const keys = new Set([
        ...Object.keys(current),
        ...Object.keys(previous),
    ]);

    return [...keys].map((key) => {
        const thisPeriod = current[key] ?? 0;
        const lastPeriod = previous[key] ?? 0;

        const hasEnoughData = thisPeriod > 0 || lastPeriod > 0;

        let changePercent: number | null = null;
        if (lastPeriod > 0) {
            changePercent = Math.round(
                ((thisPeriod - lastPeriod) / lastPeriod) * 100
            );
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

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ linkId: string }> }
) {
    await dbConnect();

    const { linkId } = await params;
    const { searchParams } = new URL(req.url);

    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
        return NextResponse.json(
            { error: 'from and to are required' },
            { status: 400 }
        );
    }

    // 1️⃣ totalClicks (fuente fuerte)
    const link = await Link.findById(linkId).select('totalClicks');
    if (!link) {
        return NextResponse.json(
            { error: 'Link not found' },
            { status: 404 }
        );
    }

    // 2️⃣ período actual
    const currentRows = await AnalyticsDaily.find({
        linkId,
        date: { $gte: from, $lte: to },
    }).lean();

    // 3️⃣ período anterior equivalente
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffMs = toDate.getTime() - fromDate.getTime();

    const prevTo = new Date(fromDate.getTime() - 1);
    const prevFrom = new Date(prevTo.getTime() - diffMs);

    const prevFromKey = prevFrom.toISOString().slice(0, 10);
    const prevToKey = prevTo.toISOString().slice(0, 10);

    const previousRows = await AnalyticsDaily.find({
        linkId,
        date: { $gte: prevFromKey, $lte: prevToKey },
    }).lean();

    // 4️⃣ aggregates visibles
    const daily: { date: string; clicks: number }[] = [];
    const byCountry: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const byDevice: Record<string, number> = {};

    for (const row of currentRows) {
        daily.push({
            date: row.date,
            clicks: row.totalClicks ?? 0,
        });

        sumMap(byCountry, row.byCountry);
        sumMap(bySource, row.bySource);
        sumMap(byDevice, row.byDevice);
    }

    daily.sort((a, b) => a.date.localeCompare(b.date));

    // 5️⃣ trends
    const deviceTrends = buildTrends(
        currentRows,
        previousRows,
        'byDevice'
    );

    const sourceTrends = buildTrends(
        currentRows,
        previousRows,
        'bySource'
    );

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
    });
}
