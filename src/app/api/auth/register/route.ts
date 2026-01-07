/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/app/models/user';
import bcrypt from 'bcryptjs';
import rateLimit from '@/lib/rate-limit';
import { validateRequestBody, registerSchema } from '@/core/utils/validation';
import { logger, SecurityEvents } from '@/lib/logger';
import { withErrorHandler, AppError } from '@/lib/error-handler';
import { getClientIp } from '@/lib/get-client-ip';

// ✅ Rate limiter específico para registro
const registerLimiter = rateLimit({
  interval: 5 * 60 * 1000, // 5 minutos
  uniqueTokenPerInterval: 500,
});

async function registerHandler(req: NextRequest) {
  // ✅ 1. Rate Limiting
  try {
    await registerLimiter.check(req, 3); // Máximo 3 intentos cada 5 minutos
  } catch {
    const ip = getClientIp(req);

    logger.security(SecurityEvents.RATE_LIMIT_EXCEEDED, {
      ip,
      endpoint: '/api/auth/register',
    });

    return NextResponse.json(
      {
        error: 'Too many registration attempts. Please try again in 5 minutes.',
        retryAfter: 300,
      },
      {
        status: 429,
        headers: {
          'Retry-After': '300',
        },
      }
    );
  }

  // ✅ 2. Validar y sanitizar input con Zod
  const validation = await validateRequestBody(req, registerSchema);

  if (!validation.success) {
    logger.warn('Registration validation failed', {
      error: validation.error,
      ip: getClientIp(req),
    });
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { email, username, password } = validation.data;

  await dbConnect();

  // ✅ 3. Verificar si el usuario ya existe
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    // ✅ No revelar qué campo ya existe (security by obscurity)
    // Pero sí logearlo internamente
    logger.warn('Registration attempt with existing credentials', {
      existingEmail: existingUser.email === email,
      existingUsername: existingUser.username === username,
      attemptedEmail: email,
      attemptedUsername: username,
      ip: getClientIp(req),
    });

    // Mensaje genérico al usuario
    if (existingUser.email === email) {
      throw new AppError(400, 'Email already registered');
    }
    if (existingUser.username === username) {
      throw new AppError(400, 'Username already taken');
    }
  }

  // ✅ 4. Hash password con bcrypt (cost factor 12 para mayor seguridad)
  const hashedPassword = await bcrypt.hash(password, 12);

  // ✅ 5. Crear usuario
  try {
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      accountType: 'free',
      isPremium: false,
      premiumExpiresAt: null,
      createdAt: new Date(),
    });

    // ✅ 6. Log exitoso (sin datos sensibles)
    logger.info('User registered successfully', {
      userId: user._id.toString(),
      username: user.username,
      accountType: user.accountType,
      ip: getClientIp(req),
    });

    // ✅ 7. Respuesta sin datos sensibles
    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    // ✅ 8. Manejo de errores de MongoDB
    if (error.code === 11000) {
      // Duplicate key error - no debería pasar por las validaciones previas
      logger.error('Unexpected duplicate key error during registration', {
        error: error.message,
        keyPattern: error.keyPattern,
        ip: getClientIp(req),
      });

      throw new AppError(409, 'User already exists');
    }

    // Propagar otros errores
    throw error;
  }
}

// ✅ Exportar con error handling
export const POST = withErrorHandler(registerHandler);
