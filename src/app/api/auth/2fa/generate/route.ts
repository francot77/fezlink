import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const secret = authenticator.generateSecret();
  const userEmail = session.user.email || 'user@example.com';

  const otpauth = authenticator.keyuri(
    userEmail,
    'FezLink', // App Name
    secret
  );

  try {
    const qrCode = await QRCode.toDataURL(otpauth);
    return NextResponse.json({ secret, qrCode });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
