import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import clicks from '@/app/models/clicks';
import mongoose from 'mongoose';

interface MatchFilter {
    linkId: mongoose.Types.ObjectId;
    timestamp: {
        $gte: Date;
        $lte: Date;
    };
    country?: string;
}

export async function GET(req: NextRequest) {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get('linkId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const country = searchParams.get('country'); // opcional

    if (!linkId || !startDate || !endDate) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    try {


        const matchFilter: MatchFilter = {
            linkId: new mongoose.Types.ObjectId(linkId),
            timestamp: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            },
        };
        if (country) matchFilter.country = country;

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

        return NextResponse.json({ stats });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
