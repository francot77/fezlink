// src/lib/auth-helpers.ts
import { getServerSession } from 'next-auth';
import User, { IUser } from '@/app/models/user'; // Tu modelo de User
import dbConnect from '@/lib/mongodb';
import { authOptions } from './auth-options';

export interface AuthSession {
  userId: string;
  email: string;
  isPremium: boolean;
  accountType: 'free' | 'starter' | 'pro';
  premiumExpiresAt?: number;
  isVerified: boolean;
}

export async function getAuth(): Promise<{
  userId: string | null;
  session: AuthSession | null;
}> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { userId: null, session: null };
  }

  await dbConnect();

  // Obtener metadata del usuario desde DB
  const user = await User.findById(session.user.id).lean<IUser>();

  if (!user) {
    return { userId: null, session: null };
  }

  // Compatibilidad: starter y pro se consideran "premium" para lógica legacy
  // REMOVIDO: ya no aceptamos 'premium' como legacy válido
  const isLegacyPremium = user.accountType === 'starter' || user.accountType === 'pro';

  // Si viene 'premium' de la base de datos, lo tratamos como 'free' (o inválido)
  // para forzar la migración o evitar accesos indebidos.
  let effectiveAccountType = user.accountType as string;
  if (effectiveAccountType === 'premium') {
    effectiveAccountType = 'free'; // O podrías dejarlo como 'free' para que no tenga acceso a nada extra
  }

  return {
    userId: session.user.id,
    session: {
      userId: session.user.id,
      email: user.email,
      isPremium: isLegacyPremium, // Solo true si es starter o pro
      accountType: (effectiveAccountType as 'free' | 'starter' | 'pro') || 'free',
      premiumExpiresAt: user.premiumExpiresAt,
      isVerified: user.isVerified,
    },
  };
}

/**
 * Verifica si el usuario tiene algún plan de pago activo (Starter o Pro)
 */
export function isPremiumActive(session: AuthSession | null): boolean {
  if (!session) return false;

  // Si es free, no es premium
  if (session.accountType === 'free') return false;

  // Si tiene fecha de expiración, verificarla
  if (session.premiumExpiresAt) {
    return session.premiumExpiresAt > Date.now();
  }

  // Si tiene plan starter/pro y no tiene fecha de expiración (lifetime o managed elsewhere), es válido
  return true;
}

/**
 * Verifica si el usuario tiene plan PRO activo
 */
export function isProActive(session: AuthSession | null): boolean {
  if (!isPremiumActive(session)) return false;
  return session?.accountType === 'pro';
}

/**
 * Middleware helper para endpoints que requieren autenticación
 */
export async function requireAuth() {
  const { userId, session } = await getAuth();

  if (!userId || !session) {
    throw new Error('Unauthorized');
  }

  return { userId, session };
}

/**
 * Middleware helper para endpoints que requieren premium (Starter o Pro)
 */
export async function requirePremium() {
  const { userId, session } = await requireAuth();

  if (!isPremiumActive(session)) {
    throw new Error('Premium subscription required');
  }

  return { userId, session };
}

/**
 * Middleware helper para endpoints que requieren plan PRO
 */
export async function requirePro() {
  const { userId, session } = await requireAuth();

  if (!isProActive(session)) {
    throw new Error('Pro subscription required');
  }

  return { userId, session };
}
