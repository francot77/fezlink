import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import clicks from '@/app/models/clicks';
import mongoose from 'mongoose';
import { auth } from '@clerk/nextjs/server';
import { Link } from '@/app/models/links';

interface Trend {
    key: string;
    thisWeek: number;
    lastWeek: number;
    changePercent: number | null;
    hasEnoughData: boolean;
    label?: string;
}

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

        if (parsedStart > parsedEnd) {
            return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(linkId)) {
            return NextResponse.json({ error: 'Invalid linkId' }, { status: 400 });
        }

        const ownedLink = await Link.exists({ _id: linkId, userId });
        if (!ownedLink) {
            return NextResponse.json({ error: 'Link not found' }, { status: 404 });
        }

        const linkObjectId = new mongoose.Types.ObjectId(linkId);

        const matchFilter: MatchFilter = {
            linkId: linkObjectId,
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

        const comparisonDuration = parsedEnd.getTime() - parsedStart.getTime() + 24 * 60 * 60 * 1000;
        const comparisonStart = new Date(parsedStart.getTime() - comparisonDuration);

        const comparisonMatchFilter: MatchFilter = {
            linkId: linkObjectId,
            timestamp: {
                $gte: comparisonStart,
                $lte: parsedEnd,
            },
        };

        if (country) comparisonMatchFilter.country = country;
        if (deviceType) comparisonMatchFilter.deviceType = deviceType;
        if (source) comparisonMatchFilter.source = source;

        const comparisonAggregation = await clicks.aggregate([
            { $match: comparisonMatchFilter },
            {
                $project: {
                    source: { $ifNull: ['$source', 'default'] },
                    deviceType: { $ifNull: ['$deviceType', 'unknown'] },
                    period: {
                        $cond: [
                            {
                                $and: [
                                    { $gte: ['$timestamp', parsedStart] },
                                    { $lte: ['$timestamp', parsedEnd] },
                                ],
                            },
                            'current',
                            'previous',
                        ],
                    },
                },
            },
            {
                $facet: {
                    bySource: [
                        {
                            $group: {
                                _id: { source: '$source', period: '$period' },
                                clicks: { $sum: 1 },
                            },
                        },
                    ],
                    byDevice: [
                        {
                            $group: {
                                _id: { deviceType: '$deviceType', period: '$period' },
                                clicks: { $sum: 1 },
                            },
                        },
                    ],
                },
            },
        ]);

        const [comparisonResult] = comparisonAggregation as unknown as [
            { bySource: { _id: { source: string; period: 'current' | 'previous' }; clicks: number }[]; byDevice: { _id: { deviceType: string; period: 'current' | 'previous' }; clicks: number }[] }?,
        ];

        const buildTrends = <T extends 'source' | 'deviceType'>(groups: { _id: Record<T | 'period', string>; clicks: number }[], key: T, defaultKey: string): Trend[] => {
            const trendMap = new Map<string, { thisWeek: number; lastWeek: number }>();

            groups.forEach(({ _id, clicks }) => {
                const trendKey = (typeof _id[key] === 'string' ? (_id[key] as string) : defaultKey) || defaultKey;
                const current = trendMap.get(trendKey) ?? { thisWeek: 0, lastWeek: 0 };

                if (_id.period === 'current') {
                    current.thisWeek += clicks;
                } else {
                    current.lastWeek += clicks;
                }

                trendMap.set(trendKey, current);
            });

            return Array.from(trendMap.entries()).map(([trendKey, { thisWeek, lastWeek }]) => {
                let changePercent: number | null = null;
                let hasEnoughData = true;
                let label: string | undefined;

                if (lastWeek === 0 && thisWeek === 0) {
                    hasEnoughData = false;
                    label = 'Not enough data yet';
                } else if (lastWeek === 0 && thisWeek > 0) {
                    changePercent = 100;
                    label = 'New this period';
                } else if (lastWeek > 0) {
                    changePercent = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
                }

                const trend: Trend = {
                    key: trendKey,
                    thisWeek,
                    lastWeek,
                    changePercent,
                    hasEnoughData,
                };

                if (label) {
                    trend.label = label;
                }

                return trend;
            });
        };

        const sourceTrends = buildTrends(comparisonResult?.bySource ?? [], 'source', 'default');
        const deviceTrends = buildTrends(comparisonResult?.byDevice ?? [], 'deviceType', 'unknown');

        return NextResponse.json({ stats, deviceTotals, sourceTotals, sourceTrends, deviceTrends });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
