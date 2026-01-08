import { NextResponse } from 'next/server';
import { getAuth, isPremiumActive } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { session } = await getAuth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      isPremium: isPremiumActive(session),
      accountType: session.accountType || 'free',
      expiresAt: session.premiumExpiresAt,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
