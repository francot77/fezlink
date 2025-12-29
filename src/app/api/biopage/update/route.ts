import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Biopage from '@/app/models/bioPages';
import { requireAuth } from '@/lib/auth-helpers';

export async function PUT(req: Request) {
    try {
        const { userId } = await requireAuth();
        const body = await req.json();
        const { links, backgroundColor, textColor, avatarUrl, description } = body;

        await dbConnect();

        const updated = await Biopage.findOneAndUpdate(
            { userId },
            { $set: { links, backgroundColor, textColor, avatarUrl, description } },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ error: 'Biopage not found' }, { status: 404 });
        }

        return NextResponse.json({ biopage: updated });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}