import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/app/models/user';
import { sendVerificationEmail } from '@/lib/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { logger } from '@/lib/logger';
import { AppError, withErrorHandler } from '@/lib/error-handler';
import rateLimit from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-client-ip';

const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
});

async function verifyEmailHandler(req: NextRequest) {
  // 1. Rate Limiting
  try {
    await limiter.check(req, 5); // 5 requests per hour
  } catch {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  // 2. Authentication Check (optional: can also take email in body if not logged in)
  const session = await getServerSession(authOptions);
  let userId = session?.user?.id;
  let email = session?.user?.email;

  if (!userId) {
    // If not logged in, allow providing email in body (e.g. from "Resend verification" on login page)
    try {
      const body = await req.json();
      if (body.email) {
        await dbConnect();
        const user = await User.findOne({ email: body.email });
        if (!user) {
          // Silent failure for security (don't reveal email existence)
          return NextResponse.json({ message: 'If the email exists, a verification link has been sent.' });
        }
        userId = user._id;
        email = user.email;
        if (user.isVerified) {
          return NextResponse.json({ message: 'Email already verified.' });
        }
      } else {
        throw new AppError(401, 'Unauthorized');
      }
    } catch (e) {
      if (e instanceof AppError) throw e;
      // If json parse fails or other error
      throw new AppError(401, 'Unauthorized');
    }
  }

  await dbConnect();
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  if (user.isVerified) {
    return NextResponse.json({ message: 'Email already verified' }, { status: 400 });
  }

  // 3. Generate Token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  // 4. Save to DB
  user.verificationToken = hashedToken;
  user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  user.lastVerificationEmailSent = new Date();
  await user.save();

  // 5. Send Email
  await sendVerificationEmail(email!, rawToken, user.username, user.language || 'es');

  logger.info(`Verification email sent to user ${userId}`, {
    ip: getClientIp(req),
    userId,
  });

  return NextResponse.json({
    message: 'Verification email sent successfully',
    lastSent: user.lastVerificationEmailSent
  });
}

// GET Endpoint to fetch cooldown status
async function getStatusHandler(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new AppError(401, 'Unauthorized');
  }

  await dbConnect();
  const user = await User.findById(session.user.id).select('lastVerificationEmailSent isVerified');

  if (!user) throw new AppError(404, 'User not found');

  let cooldownRemaining = 0;
  if (user.lastVerificationEmailSent) {
    const timeSince = Date.now() - new Date(user.lastVerificationEmailSent).getTime();
    if (timeSince < 60 * 1000) {
      cooldownRemaining = Math.ceil((60 * 1000 - timeSince) / 1000);
    }
  }

  return NextResponse.json({
    isVerified: user.isVerified,
    lastSent: user.lastVerificationEmailSent,
    cooldownRemaining,
    hasSentBefore: !!user.lastVerificationEmailSent
  });
}

export const POST = withErrorHandler(verifyEmailHandler);
export const GET = withErrorHandler(getStatusHandler);
