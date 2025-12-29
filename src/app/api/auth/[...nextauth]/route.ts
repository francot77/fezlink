// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { Session, SessionStrategy, User } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongoClient';

export const authOptions = {
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        GitHub({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
    ],
    session: {
        strategy: 'database' as SessionStrategy,
    },
    callbacks: {
        session({ session, user }: { session: Session; user: User }) {
            if (session.user) {
                session.user.id = user.id; // 👈 ObjectId
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
