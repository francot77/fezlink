// /app/api/metrics/summary/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LinkStats } from '@/app/models/linkStats';
import { LinkStat } from '@/types/globals';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get('linkId');

    if (!linkId) {
        return NextResponse.json({ error: 'Missing linkId' }, { status: 400 });
    }

    await dbConnect();

    const stats = await LinkStats.findOne({ linkId });

    if (!stats) {
        return NextResponse.json({ totalClicks: 0, countries: [], countryMetrics: [] });
    }

    const countryTotals = stats.countries.reduce<Record<string, number>>((acc, entry: LinkStat) => {
        acc[entry.country] = (acc[entry.country] || 0) + entry.clicksCount;
        return acc;
    }, {});

    const countryMetrics = Object.entries(countryTotals)
        .map(([country, clicks]) => ({ country, clicks }))
        .sort((a, b) => b.clicks - a.clicks);

    const totalClicks = countryMetrics.reduce((sum, entry) => sum + entry.clicks, 0);
    const countries = countryMetrics.map((entry) => entry.country);

    return NextResponse.json({ totalClicks, countries, countryMetrics });
}
