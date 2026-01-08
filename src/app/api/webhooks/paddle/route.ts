import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import User from '@/app/models/user';

import { sendEmail } from '@/lib/email';
import dbConnect from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const headers = request.headers;
    const paddleSignature = headers.get('paddle-signature');
    const secretKey = process.env.PADDLE_WEBHOOK_SECRET_KEY;

    if (!paddleSignature || !secretKey) {
      console.error('Missing signature or secret key');
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }

    // Validación de Firma (Simplificada pero robusta)
    const parts = paddleSignature.split(';');
    const timestampPart = parts.find(p => p.startsWith('ts='))?.split('=')[1];
    const signaturePart = parts.find(p => p.startsWith('h1='))?.split('=')[1];

    if (!timestampPart || !signaturePart) {
      console.error('Invalid signature format');
      return NextResponse.json({ message: 'Invalid signature format' }, { status: 401 });
    }

    const bodyRaw = await request.text();
    const signedPayload = `${timestampPart}:${bodyRaw}`;
    const hashedPayload = createHmac('sha256', secretKey)
      .update(signedPayload)
      .digest('hex');

    if (hashedPayload !== signaturePart) {
      console.error('Invalid signature');
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
    }

    const bodyJson = JSON.parse(bodyRaw);
    console.log('Paddle Webhook Received:', JSON.stringify(bodyJson, null, 2));

    await dbConnect()

    const eventType = bodyJson.event_type;
    const data = bodyJson.data;

    // IDs de Planes
    const STARTER_MONTHLY = 'pri_01kefrnn3x4zexm6jwhkf5rszv';
    const STARTER_ANNUAL = 'pri_01kefrpvn1s48jfdwndjc0ppnw';
    const PRO_MONTHLY = 'pri_01jwryd6rgxfdh50rknhcqh1aq';
    const PRO_ANNUAL = 'pri_01jwryfkyzp3jrbj7xw8hjp585';

    // 1. Manejo de Suscripción Creada o Actualizada
    if (eventType === 'subscription.created' || eventType === 'subscription.updated' || eventType === 'transaction.completed') {
      // Intentar obtener userId de custom_data (checkout) o de la base de datos si es un evento de ciclo de vida
      let userId = data.custom_data?.userId;

      const subscriptionId = data.id || data.subscription_id;

      // Si no viene en el webhook (ej. renovación automática), buscar por subscriptionId
      if (!userId && subscriptionId) {
        console.log(`Searching user by subscriptionId: ${subscriptionId}`);
        const existingUser = await User.findOne({ subscriptionId });
        if (existingUser) {
          userId = existingUser._id;
          console.log(`User found by subscriptionId: ${userId}`);
        } else {
          console.warn(`No user found for subscriptionId: ${subscriptionId}`);
        }
      }

      if (userId) {
        const priceId = data.items?.[0]?.price?.id;
        const customerId = data.customer_id;
        const status = data.status || 'active'; // transaction.completed no tiene status de sub, asumimos active si pagó

        let accountType = 'free';
        let duration = 0;

        if ([STARTER_MONTHLY, STARTER_ANNUAL].includes(priceId)) accountType = 'starter';
        if ([PRO_MONTHLY, PRO_ANNUAL].includes(priceId)) accountType = 'pro';

        // Calcular expiración
        if (data.next_billed_at) {
          // Paddle envía next_billed_at en ISO string
          duration = new Date(data.next_billed_at).getTime();
        } else {
          // Fallback si no viene (ej. transaction.completed sin info de sub detallada)
          const now = Date.now();
          const isAnnual = [STARTER_ANNUAL, PRO_ANNUAL].includes(priceId);
          duration = now + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000;
        }

        await User.findByIdAndUpdate(userId, {
          accountType,
          premiumExpiresAt: duration,
          subscriptionId,
          customerId,
          subscriptionStatus: status,
          nextBillDate: new Date(duration)
        });

        console.log(`User ${userId} successfully updated to ${accountType}. Status: ${status}, Expires: ${new Date(duration)}`);

        // Enviar Email solo en creación
        if (eventType === 'subscription.created') {
          const user = await User.findById(userId);
          if (user) {
            await sendEmail({
              to: user.email,
              subject: '¡Bienvenido a Premium! - URLShortener',
              html: `<h1>¡Tu suscripción ${accountType.toUpperCase()} está activa!</h1><p>Gracias por tu compra.</p>`
            });
          }
        }
      }
    }

    // 2. Manejo de Cancelación
    if (eventType === 'subscription.canceled') {
      // Buscar por subscription_id ya que custom_data podría no venir en eventos de ciclo de vida
      const subscriptionId = data.id;
      await User.findOneAndUpdate({ subscriptionId }, {
        subscriptionStatus: 'canceled',
        // No cambiamos accountType a 'free' inmediatamente, esperamos a que expire premiumExpiresAt
      });
      console.log(`Subscription ${subscriptionId} canceled`);
    }

    return NextResponse.json({ message: 'Success' }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
