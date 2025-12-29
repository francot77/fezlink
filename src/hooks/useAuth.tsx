import { useSession } from 'next-auth/react';

export function useAuth() {
    const { data: session, status } = useSession();

    return {
        user: session?.user,
        isLoaded: status !== 'loading',
        isSignedIn: !!session,
        userId: session?.user?.id,
    };
}