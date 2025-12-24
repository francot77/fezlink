// src/app/api/metrics/debug/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import clicks from '@/app/models/clicks';
import mongoose from 'mongoose';
import { auth } from '@clerk/nextjs/server';
import { Link } from '@/app/models/links';

export async function GET(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get('linkId');

    if (!linkId || !mongoose.Types.ObjectId.isValid(linkId)) {
        return NextResponse.json({ error: 'Invalid linkId' }, { status: 400 });
    }

    const ownedLink = await Link.exists({ _id: linkId, userId });
    if (!ownedLink) {
        return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    const linkObjectId = new mongoose.Types.ObjectId(linkId);

    // Obtener datos completos para análisis
    const totalClicks = await clicks.countDocuments({ linkId: linkObjectId });

    // Últimos 10 clicks para ver estructura
    const sampleClicks = await clicks
        .find({ linkId: linkObjectId })
        .sort({ timestamp: -1 })
        .limit(10)
        .lean();

    // Rango de fechas de clicks
    const dateRange = await clicks.aggregate([
        { $match: { linkId: linkObjectId } },
        {
            $group: {
                _id: null,
                firstClick: { $min: '$timestamp' },
                lastClick: { $max: '$timestamp' },
            },
        },
    ]);

    // Todos los sources únicos
    const uniqueSources = await clicks.distinct('source', { linkId: linkObjectId });

    // Todos los deviceTypes únicos
    const uniqueDevices = await clicks.distinct('deviceType', { linkId: linkObjectId });

    // Clicks por source
    const clicksBySource = await clicks.aggregate([
        { $match: { linkId: linkObjectId } },
        {
            $group: {
                _id: { $ifNull: ['$source', 'NO_SOURCE_SET'] },
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
    ]);

    // Clicks por device
    const clicksByDevice = await clicks.aggregate([
        { $match: { linkId: linkObjectId } },
        {
            $group: {
                _id: { $ifNull: ['$deviceType', 'NO_DEVICE_SET'] },
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
    ]);

    // Clicks de última semana
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const lastWeekClicks = await clicks.countDocuments({
        linkId: linkObjectId,
        timestamp: { $gte: oneWeekAgo },
    });

    // Clicks de última semana por source
    const lastWeekBySource = await clicks.aggregate([
        {
            $match: {
                linkId: linkObjectId,
                timestamp: { $gte: oneWeekAgo },
            }
        },
        {
            $group: {
                _id: { $ifNull: ['$source', 'NO_SOURCE_SET'] },
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
    ]);

    return NextResponse.json({
        summary: {
            totalClicks,
            lastWeekClicks,
            dateRange: dateRange[0] || null,
            uniqueSources,
            uniqueDevices,
        },
        distribution: {
            clicksBySource,
            clicksByDevice,
            lastWeekBySource,
        },
        sampleData: sampleClicks,
        diagnosis: {
            hasClicks: totalClicks > 0,
            hasRecentClicks: lastWeekClicks > 0,
            hasSourceData: uniqueSources.length > 0,
            hasDeviceData: uniqueDevices.length > 0,
            sourceIssue: uniqueSources.length === 0 ? 'NO SOURCES STORED' : null,
            recentClicksIssue: lastWeekClicks === 0 && totalClicks > 0 ? 'CLICKS ARE OLD - ADJUST DATE RANGE' : null,
        },
    });
}