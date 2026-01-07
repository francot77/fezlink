import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/app/models/user';
import rateLimit from '@/lib/rate-limit';

// ✅ Crear instancia del rate limiter
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500,
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');

  // ✅ Rate limiting agresivo
  try {
    await limiter.check(req, 5); // máximo 5 intentos por minuto
  } catch {
    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        retryAfter: 60,
      },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
        },
      }
    );
  }

  // ✅ Validación inicial
  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  // ✅ Validación de longitud y formato
  if (username.length < 3 || username.length > 20) {
    return NextResponse.json({ available: false });
  }

  // ✅ Sanitizar input - solo permitir caracteres válidos
  const sanitized = username.toLowerCase().replace(/[^a-z0-9_-]/g, '');

  if (sanitized !== username.toLowerCase()) {
    return NextResponse.json({ available: false });
  }

  await dbConnect();

  // ✅ Buscar usuario existente
  const existingUser = await User.findOne({
    username: sanitized,
  });

  // ✅ Agregar delay aleatorio para dificultar timing attacks
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 100 + 50));

  return NextResponse.json({
    available: !existingUser,
  });
}
