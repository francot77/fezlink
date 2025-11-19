import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import clicks from '@/app/models/clicks';
import mongoose from 'mongoose';
import { auth } from '@clerk/nextjs/server';
import { Link } from '@/app/models/links';

interface MatchFilter {
    linkId: mongoose.Types.ObjectId;
    timestamp: {
        $gte: Date;
        $lte: Date;
    };
    country?: string;
    deviceType?: string;
    source?: string;
}

export async function GET(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get('linkId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const country = searchParams.get('country'); // opcional
    const deviceType = searchParams.get('deviceType'); // opcional
    const groupByDevice = searchParams.get('groupByDevice') === 'true';
    const groupBySource = searchParams.get('groupBySource') === 'true';
    const source = searchParams.get('source');

    const allowedDeviceTypes = ['mobile', 'desktop', 'tablet', 'unknown'];
    if (deviceType && !allowedDeviceTypes.includes(deviceType)) {
        return NextResponse.json({ error: 'Invalid deviceType' }, { status: 400 });
    }

    if (!linkId || !startDate || !endDate) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    try {
        const parsedStart = new Date(startDate);
        const parsedEnd = new Date(endDate);
        if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
            return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
        }

        parsedStart.setUTCHours(0, 0, 0, 0);
        parsedEnd.setUTCHours(23, 59, 59, 999);

        if (!mongoose.Types.ObjectId.isValid(linkId)) {
            return NextResponse.json({ error: 'Invalid linkId' }, { status: 400 });
        }

        const ownedLink = await Link.exists({ _id: linkId, userId });
        if (!ownedLink) {
            return NextResponse.json({ error: 'Link not found' }, { status: 404 });
        }

        const matchFilter: MatchFilter = {
            linkId: new mongoose.Types.ObjectId(linkId),
            timestamp: {
                $gte: parsedStart,
                $lte: parsedEnd,
            },
        };
        if (country) matchFilter.country = country;
        if (deviceType) matchFilter.deviceType = deviceType;
        if (source) matchFilter.source = source;

        const stats = await clicks.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: {
                        year: { $year: '$timestamp' },
                        month: { $month: '$timestamp' },
                        day: { $dayOfMonth: '$timestamp' },
                    },
                    clicks: { $sum: 1 },
                },
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
            },
        ]);

        let deviceTotals: { deviceType: string; clicks: number }[] = [];
        let sourceTotals: { source: string; clicks: number }[] = [];

        if (groupByDevice) {
            deviceTotals = await clicks.aggregate([
                { $match: matchFilter },
                {
                    $group: {
                        _id: '$deviceType',
                        clicks: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        deviceType: { $ifNull: ['$_id', 'unknown'] },
                        clicks: 1,
                    },
                },
                { $sort: { clicks: -1 } },
            ]);
        }

        if (groupBySource) {
            sourceTotals = await clicks.aggregate([
                { $match: matchFilter },
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
                { $sort: { clicks: -1 } },
            ]);
        }

        return NextResponse.json({ stats, deviceTotals, sourceTotals });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
