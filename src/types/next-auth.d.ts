import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      isTwoFactorEnabled: boolean;
      isVerified: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    isTwoFactorEnabled: boolean;
    isVerified: boolean;
    tokenVersion: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    version?: number;
    isTwoFactorEnabled: boolean;
    isVerified: boolean;
  }
}
