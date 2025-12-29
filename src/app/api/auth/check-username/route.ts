import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/app/models/user';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
        return NextResponse.json(
            { error: 'Username is required' },
            { status: 400 }
        );
    }

    if (username.length < 3) {
        return NextResponse.json({ available: false });
    }

    await dbConnect();

    const existingUser = await User.findOne({
        username: username.toLowerCase()
    });

    return NextResponse.json({ available: !existingUser });
}