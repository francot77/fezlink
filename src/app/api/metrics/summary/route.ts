// /app/api/metrics/summary/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { LinkStats } from '@/app/models/linkStats';
import { LinkStat } from '@/types/globals';
import { auth } from '@clerk/nextjs/server';
import { Link } from '@/app/models/links';
import Clicks from '@/app/models/clicks';
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get('linkId');

    if (!linkId) {
        return NextResponse.json({ error: 'Missing linkId' }, { status: 400 });
    }

    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(linkId)) {
        return NextResponse.json({ error: 'Invalid linkId' }, { status: 400 });
    }

    const ownedLink = await Link.exists({ _id: linkId, userId });
    if (!ownedLink) {
        return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    const [stats, clicksBySourceAggregation] = await Promise.all([
        LinkStats.findOne({ linkId: new mongoose.Types.ObjectId(linkId) }),
        Clicks.aggregate([
            { $match: { linkId: new mongoose.Types.ObjectId(linkId) } },
            {
                $group: {
                    _id: { $ifNull: ['$source', 'default'] },
                    clicks: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    source: '$_id',
                    clicks: 1,
                },
            },
        ]),
    ]);

    const totalClicks = stats?.countries?.reduce((sum: number, entry: LinkStat) => sum + entry.clicksCount, 0) ?? 0;
    const countries = stats?.countries?.map((entry: LinkStat) => entry.country) ?? [];
    const clicksBySource = clicksBySourceAggregation.reduce((acc: Record<string, number>, entry) => {
        acc[entry.source] = entry.clicks;
        return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({ totalClicks, countries, clicksBySource });
}
