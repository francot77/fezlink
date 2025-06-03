import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Biopage from '@/app/models/bioPages';
import { auth } from '@clerk/nextjs/server';

function isPremiumActive(sessionClaims: CustomJwtSessionClaims): boolean {

    const metadata = sessionClaims.metadata;
    if (!metadata || metadata.accountType !== 'premium') return false;
    const expirationDate = Number(metadata.expiresAt);
    console.log("entroaca")
    return expirationDate > Date.now();
}

export async function PUT(req: Request) {
    const { userId } = await auth();
    const { sessionClaims } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!isPremiumActive(sessionClaims as CustomJwtSessionClaims)) return NextResponse.json({ error: 'Not Premium active' }, { status: 401 })
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
