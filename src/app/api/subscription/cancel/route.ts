import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import User from '@/app/models/user';

import { sendEmail } from '@/lib/email';
import dbConnect from '@/lib/mongodb';
import { authOptions } from '@/lib/auth-options';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect()
    const user = await User.findOne({ email: session.user.email });

    if (!user || !user.subscriptionId) {
      return NextResponse.json({ message: 'No active subscription found' }, { status: 404 });
    }

    // Llamada a la API de Paddle para cancelar
    const paddleApiUrl = process.env.PADDLE_API_URL || 'https://api.paddle.com'; // O sandbox-api.paddle.com
    const apiKey = process.env.PADDLE_API_KEY;

    if (!apiKey) {
      console.error('PADDLE_API_KEY is missing');
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    const response = await fetch(`${paddleApiUrl}/subscriptions/${user.subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        effective_from: 'next_billing_period', // Cancelar al final del ciclo
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Paddle API Error:', errorData);
      return NextResponse.json({ message: 'Failed to cancel subscription with provider' }, { status: 500 });
    }

    // Actualizar estado local
    user.subscriptionStatus = 'canceled';
    await user.save();

    // Enviar email de confirmación
    await sendEmail({
      to: user.email,
      subject: 'Subscription Canceled - URLShortener',
      html: `
        <h1>Subscription Canceled</h1>
        <p>Your subscription has been scheduled for cancellation.</p>
        <p>You will retain access to premium features until the end of your current billing period.</p>
        <p>If this was a mistake, please contact support.</p>
      `,
    });

    return NextResponse.json({ message: 'Subscription canceled successfully' });
  } catch (error) {
    console.error('Cancel Subscription Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
