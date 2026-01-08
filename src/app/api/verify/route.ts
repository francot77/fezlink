import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/app/models/user';
import { withErrorHandler, AppError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { getClientIp } from '@/lib/get-client-ip';

async function verifyHandler(req: NextRequest) {
  // Support both POST (JSON) and GET (Query Param) for flexibility
  let token: string | null = null;

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      token = body.token;
    } catch {
      throw new AppError(400, 'Invalid JSON body');
    }
  } else {
    const { searchParams } = new URL(req.url);
    token = searchParams.get('token');
  }

  if (!token) {
    throw new AppError(400, 'Token is required');
  }

  // Hash the token to match DB
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  await dbConnect();

  // Find user with this token AND token not expired
  // Note: We need to explicitly select verificationToken because it's { select: false } in schema
  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpiry: { $gt: new Date() },
  }).select('+verificationToken +verificationTokenExpiry');

  if (!user) {
    // Check if it was a valid token but expired?
    // We can't distinguish easily without two queries or a more complex one.
    // For now, generic error.
    throw new AppError(400, 'Invalid or expired verification token');
  }

  // Update user
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();

  logger.info(`User ${user._id} verified email successfully`, {
    ip: getClientIp(req),
    userId: user._id,
  });

  return NextResponse.json({
    message: 'Email verified successfully',
    email: user.email,
  });
}

export const POST = withErrorHandler(verifyHandler);
export const GET = withErrorHandler(verifyHandler);
