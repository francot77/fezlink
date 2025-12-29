// src/app/api/auth/check-username/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/app/models/user';

export async function GET(req: NextRequest) {
    const username = req.nextUrl.searchParams.get('username');

    if (!username || username.length < 3) {
        return NextResponse.json({ available: false });
    }

    await dbConnect();

    const exists = await User.exists({
        username: username.toLowerCase(),
    });

    return NextResponse.json({
        available: !exists,
    });
}
