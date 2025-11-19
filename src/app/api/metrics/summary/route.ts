// /app/api/metrics/summary/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { LinkStats } from '@/app/models/linkStats';
import { LinkStat } from '@/types/globals';
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get('linkId');

    if (!linkId) {
        return NextResponse.json({ error: 'Missing linkId' }, { status: 400 });
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(linkId)) {
        return NextResponse.json({ error: 'Invalid linkId' }, { status: 400 });
    }

    const stats = await LinkStats.findOne({ linkId: new mongoose.Types.ObjectId(linkId) });

    if (!stats) {
        return NextResponse.json({ totalClicks: 0, countries: [] });
    }

    const totalClicks = stats.countries.reduce((sum: number, entry: LinkStat) => sum + entry.clicksCount, 0);
    const countries = stats.countries.map((entry: LinkStat) => entry.country);

    return NextResponse.json({ totalClicks, countries });
}
