import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Biopage from '@/app/models/bioPages';
import { auth } from '@clerk/nextjs/server';


export async function PUT(req: Request) {
    const { userId } = await auth();
    const { sessionClaims } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const isPremium = sessionClaims?.metadata.accountType === 'premium'
    if (!isPremium) return NextResponse.json({ error: 'Not Premium account' })
    const body = await req.json();
    const { slug } = body;

    await dbConnect();

    const updated = await Biopage.findOneAndUpdate(
        { userId },
        { $set: { slug } },
    );

    if (!updated) return NextResponse.json({ error: 'Error something went wrong' }, { status: 404 });

    return NextResponse.json({ newSlug: updated });
}
