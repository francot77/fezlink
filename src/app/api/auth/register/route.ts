// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/app/models/user';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    const { email, username, password } = await req.json();

    if (!email || !username || !password) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (username.length < 3) {
        return NextResponse.json({ error: 'Username too short' }, { status: 400 });
    }

    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
        return NextResponse.json(
            { error: 'Weak password' },
            { status: 400 }
        );
    }

    await dbConnect();

    const existing = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existing) {
        return NextResponse.json(
            { error: 'User already exists' },
            { status: 409 }
        );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
        email,
        username: username.toLowerCase(),
        passwordHash,
    });

    return NextResponse.json({ ok: true });
}
