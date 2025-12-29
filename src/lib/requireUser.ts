// src/lib/requireUser.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function requireUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error('UNAUTHORIZED');
    }
    return session.user.id; // string (ObjectId)
}
