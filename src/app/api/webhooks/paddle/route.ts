import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

export async function POST(request: Request) {
  try {
    const headers = request.headers;
    const paddleSignature = headers.get('paddle-signature');
    const secretKey = process.env.PADDLE_WEBHOOK_SECRET_KEY;
    if (!paddleSignature) {
      console.error('Paddle-Signature not present in request headers');
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }
    if (!secretKey) {
      console.error('Secret key not defined');
      return NextResponse.json({ message: 'Server misconfigured' }, { status: 500 });
    }
    if (!paddleSignature.includes(';')) {
      console.error('Invalid Paddle-Signature format');
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }
    const parts = paddleSignature.split(';');
    if (parts.length !== 2) {
      console.error('Invalid Paddle-Signature format');
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }
    const [timestampPart, signaturePart] = parts.map((part) => part.split('=')[1]);
    if (!timestampPart || !signaturePart) {
      console.error('Unable to extract timestamp or signature from Paddle-Signature header');
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }
    const timestamp = timestampPart;
    const signature = signaturePart;
    const timestampInt = parseInt(timestamp) * 1000;
    if (isNaN(timestampInt)) {
      console.error('Invalid timestamp format');
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }
    const currentTime = Date.now();
    if (currentTime - timestampInt > 10000) {
      console.error(
        'Webhook event expired (timestamp is over 10 seconds old):',
        timestampInt,
        currentTime
      );
      return NextResponse.json({ message: 'Event expired' }, { status: 408 });
    }
    const bodyRaw = await request.text();
    const signedPayload = `${timestamp}:${bodyRaw}`;
    const hashedPayload = createHmac('sha256', secretKey)
      .update(signedPayload, 'utf8')
      .digest('hex');
    if (!timingSafeEqual(Buffer.from(hashedPayload), Buffer.from(signature))) {
      console.error('Computed signature does not match Paddle signature');
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
    }

    const bodyJson = JSON.parse(bodyRaw);

    //HANDLING
    if (bodyJson.event_type === 'transaction.completed') {
      if (bodyJson.data.items[0].price.id == 'pri_01jwryfkyzp3jrbj7xw8hjp585') {
        console.log('Suscripcion anual');

        //ACA ASIGNAR ACCOUNTTYPE PREMIUM Y EXPIRES AT +1 YEAR
      }
      if (bodyJson.data.items[0].price.id == 'pri_01jwryd6rgxfdh50rknhcqh1aq') {
        console.log('Suscripcion mensual');

        //ACA ASIGNAR ACCOUNTTYPE PREMIUM Y EXPIRES AT +1 YEAR
      }
    }
    return NextResponse.json({ message: 'Success' }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to verify and process Paddle webhook', error.message);
    } else {
      console.error('Failed to verify and process Paddle webhook', error);
    }
    return NextResponse.json(
      { message: 'Failed to verify and process Paddle webhook' },
      { status: 500 }
    );
  }
}
