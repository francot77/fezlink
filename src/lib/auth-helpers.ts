// src/lib/auth-helpers.ts
import { getServerSession } from 'next-auth';
import User, { IUser } from '@/app/models/user'; // Tu modelo de User
import dbConnect from '@/lib/mongodb';
import { authOptions } from './auth-options';

export interface AuthSession {
    userId: string;
    email: string;
    isPremium: boolean;
    premiumExpiresAt?: number;
}

/**
 * Reemplazo de auth() de Clerk
 * Obtiene la sesión actual y retorna userId y metadata
 */
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

    return {
        userId: session.user.id,
        session: {
            userId: session.user.id,
            email: user.email,
            isPremium: user.accountType === 'premium',
            premiumExpiresAt: user.premiumExpiresAt,
        },
    };
}

/**
 * Verifica si el usuario tiene premium activo
 */
export function isPremiumActive(session: AuthSession | null): boolean {
    if (!session || !session.isPremium) return false;

    const expirationDate = session.premiumExpiresAt;
    if (!expirationDate) return false;

    return expirationDate > Date.now();
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
 * Middleware helper para endpoints que requieren premium
 */
export async function requirePremium() {
    const { userId, session } = await requireAuth();

    if (!isPremiumActive(session)) {
        throw new Error('Premium subscription required');
    }

    return { userId, session };
}