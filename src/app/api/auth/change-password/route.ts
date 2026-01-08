import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import dbConnect from '@/lib/mongodb';
import User from '@/app/models/user';
import bcrypt from 'bcryptjs';
import { verify2FAIfEnabled } from '@/lib/2fa-helper';
import rateLimit from '@/lib/rate-limit';
import { passwordSchema } from '@/core/utils/validation';
import { withErrorHandler, AppError } from '@/lib/error-handler';
import { logger, SecurityEvents } from '@/lib/logger';
import { getClientIp } from '@/lib/get-client-ip';
import { z } from 'zod';
import { NextRequest } from 'next/server';

// Rate limiter: 5 attempts per hour per IP
const changePasswordLimiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 100,
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  otp: z.string().optional(),
});

async function changePasswordHandler(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new AppError(401, 'Unauthorized');
  }

  // 1. Rate Limiting
  try {
    await changePasswordLimiter.check(req, 5);
  } catch {
    logger.security(SecurityEvents.RATE_LIMIT_EXCEEDED, {
      userId: session.user.id,
      endpoint: '/api/auth/change-password',
      ip: getClientIp(req),
    });
    throw new AppError(429, 'Too many attempts. Please try again in an hour.');
  }

  // 2. Input Validation
  let body;
  try {
    body = await req.json();
  } catch {
    throw new AppError(400, 'Invalid JSON body');
  }

  const validation = changePasswordSchema.safeParse(body);

  if (!validation.success) {
    throw new AppError(400, validation.error.issues[0].message);
  }

  const { currentPassword, newPassword, otp } = validation.data;

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  // 3. 2FA Check
  const twoFactorCheck = await verify2FAIfEnabled(user._id.toString(), otp);
  if (!twoFactorCheck.ok) {
      if (twoFactorCheck.error === '2FA_REQUIRED') {
          throw new AppError(403, '2FA_REQUIRED');
      }
      if (twoFactorCheck.error === 'INVALID_2FA') {
          throw new AppError(403, 'INVALID_2FA');
      }
  }

  // 4. Verify Current Password
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    logger.security(SecurityEvents.UNAUTHORIZED_ACCESS, {
        userId: user._id.toString(),
        reason: 'invalid_current_password_change_attempt',
        ip: getClientIp(req)
    });
    throw new AppError(400, 'Invalid current password');
  }

  // 5. Update Password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;
  
  // Invalidate all other sessions
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  
  await user.save();

  logger.info('Password changed successfully', { userId: user._id.toString() });

  return NextResponse.json({ message: 'Password updated successfully' });
}

export const POST = withErrorHandler(changePasswordHandler);
