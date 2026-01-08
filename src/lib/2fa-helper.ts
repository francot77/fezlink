import { authenticator } from 'otplib';
import User from '@/app/models/user';
import dbConnect from '@/lib/mongodb';

export async function verify2FAIfEnabled(userId: string, code?: string) {
  await dbConnect();
  const user = await User.findById(userId).select('isTwoFactorEnabled twoFactorSecret');

  if (!user) {
    throw new Error('User not found');
  }

  if (user.isTwoFactorEnabled) {
    if (!code) {
      return { ok: false, error: '2FA_REQUIRED' };
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      return { ok: false, error: 'INVALID_2FA' };
    }
  }

  return { ok: true };
}
