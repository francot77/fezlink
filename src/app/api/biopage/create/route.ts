import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Biopage from '@/app/models/bioPages';
import { auth } from '@clerk/nextjs/server';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);

export async function POST() {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const existing = await Biopage.findOne({ userId });
    if (existing) {
        return NextResponse.json({ message: 'Biopage already exists', biopage: existing }, { status: 409 });
    }

    // Generar slug único
    let slug;
    let isUnique = false;
    while (!isUnique) {
        slug = nanoid();
        const found = await Biopage.findOne({ slug });
        if (!found) isUnique = true;
    }

    const newBiopage = await Biopage.create({
        userId,
        slug,
        links: [],
        backgroundColor: '#000000',
        textColor: '#ffffff',
        avatarUrl: '',
    });

    return NextResponse.json({ biopage: newBiopage }, { status: 201 });
}
