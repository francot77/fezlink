import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Biopage from '@/app/models/bioPages';
import { customAlphabet } from 'nanoid';
import { getAuth } from '@/lib/auth-helpers';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);

export async function POST() {
    const { userId } = await getAuth();
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
        description: 'Descubre y comparte tus enlaces destacados desde un perfil moderno y adaptable.',
    });

    return NextResponse.json({ biopage: newBiopage }, { status: 201 });
}
