import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Biopage from '@/app/models/bioPages';
import { getAuth } from '@/lib/auth-helpers';

export async function GET() {
    const { userId } = await getAuth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const biopage = await Biopage.findOne({ userId });

    if (!biopage) {
        return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json({ biopage });
}