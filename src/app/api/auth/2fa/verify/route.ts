import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth-helpers';
import dbConnect from '@/lib/mongodb';
import User from '@/app/models/user';
import { authenticator } from 'otplib';

export async function POST(req: Request) {
  try {
    const { userId } = await getAuth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token, secret } = await req.json();

    if (!token || !secret) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const isValid = authenticator.verify({ token, secret });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    await dbConnect();

    console.log(`[2FA Verify] Updating user ${userId} with secret ${secret.substring(0, 4)}...`);

    // Update user with the secret and enable 2FA
    const updatedUser = await User.findByIdAndUpdate(userId, {
      twoFactorSecret: secret,
      isTwoFactorEnabled: true,
    }, { new: true }); // new: true returns the updated document

    if (!updatedUser) {
        console.error('[2FA Verify] User not found during update');
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('[2FA Verify] Update result:', {
        id: updatedUser._id,
        enabled: updatedUser.isTwoFactorEnabled,
        hasSecret: !!updatedUser.twoFactorSecret
    });

    return NextResponse.json({ success: true, message: '2FA enabled successfully' });
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
