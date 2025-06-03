import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Biopage from '@/app/models/bioPages';
import { auth } from '@clerk/nextjs/server';

export async function PUT(req: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { links, backgroundColor, textColor, avatarUrl } = body;


    await dbConnect();

    const updated = await Biopage.findOneAndUpdate(
        { userId },
        { $set: { links, backgroundColor, textColor, avatarUrl } },
        { new: true }
    );

    if (!updated) return NextResponse.json({ error: 'Biopage not found' }, { status: 404 });

    return NextResponse.json({ biopage: updated });
}
