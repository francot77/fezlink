import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    const { sessionClaims } = await auth()
    return NextResponse.json({ isPremium: sessionClaims?.metadata.accountType === 'premium' });
}
