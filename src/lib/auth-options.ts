/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';
import User from '@/app/models/user';
import bcrypt from 'bcryptjs';

import { authenticator } from 'otplib';

// Simple in-memory cache to reduce DB calls on high-concurrency requests (e.g. dashboard load)
const userSessionCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 1000; // 10 seconds

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        otp: { label: '2FA Code', type: 'text' },
      },
      async authorize(credentials) {
        console.log('>>> [Auth] Authorize called');
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          console.log('>>> [Auth] User not found');
          return null;
        }

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) {
          console.log('>>> [Auth] Invalid password');
          return null;
        }

        // Check if 2FA is enabled
        if (user.isTwoFactorEnabled) {
          console.log('>>> [Auth] 2FA is enabled for user:', user.email);
          console.log('>>> [Auth] OTP received raw:', credentials.otp);

          // NextAuth can convert undefined to string "undefined"
          const otp = credentials.otp;
          const isOtpProvided = otp && otp !== 'undefined' && otp !== 'null' && otp.trim() !== '';

          if (!isOtpProvided) {
            console.log('>>> [Auth] OTP missing or empty, throwing 2FA_REQUIRED');
            throw new Error('2FA_REQUIRED');
          }

          const isValidOtp = authenticator.verify({
            token: otp,
            secret: user.twoFactorSecret,
          });

          if (!isValidOtp) {
            console.log('>>> [Auth] Invalid OTP, throwing INVALID_2FA');
            throw new Error('INVALID_2FA');
          }
        }

        if (user.tokenVersion === undefined) {
          user.tokenVersion = 0;
          await user.save();
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.username,
          tokenVersion: user.tokenVersion,
          isTwoFactorEnabled: user.isTwoFactorEnabled,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.version = user.tokenVersion;
        token.isTwoFactorEnabled = user.isTwoFactorEnabled;
        token.isVerified = user.isVerified;
        console.log('>>> LOGIN: Setting token version to:', token.version);
      }

      // Verify token version matches database
      if (token.id) {
        try {
          // await dbConnect(); // Connection is handled inside if(!user) block now
          // const dbUser = await User.findById(token.id).select('tokenVersion isTwoFactorEnabled isVerified');

          // If we are just logging in (user is present), we don't need to check DB yet
          // But if it's a subsequent request (user is undefined), we must check
          if (!user) {
            let dbUser;
            const now = Date.now();
            const cached = userSessionCache.get(token.id as string);

            // Check cache first
            if (cached && (now - cached.timestamp < CACHE_TTL)) {
              dbUser = cached.data;
              // console.log('>>> CACHE HIT for user:', token.id);
            } else {
              await dbConnect();
              dbUser = await User.findById(token.id).select('email tokenVersion isTwoFactorEnabled isVerified');
              if (dbUser) {
                userSessionCache.set(token.id as string, { data: dbUser, timestamp: now });
                // Clean up old cache entries periodically could be added here, but Map size is manageable for active users
              }
            }

            if (dbUser) {
              const currentVersion = dbUser.tokenVersion || 0;
              const tokenVersion = token.version || 0;
              token.isTwoFactorEnabled = dbUser.isTwoFactorEnabled; // Keep it fresh
              token.isVerified = dbUser.isVerified; // Keep it fresh

              // Only log periodically or on mismatch to reduce noise
              if (currentVersion !== tokenVersion) {
                console.log(`>>> CHECK: User ${dbUser.email} | DB Version: ${currentVersion} | Token Version: ${tokenVersion}`);
                console.log('>>> INVALIDATING SESSION due to version mismatch');
                return null as any;
              }
            }
          }
        } catch (error) {
          console.error('Error verifying token version:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      // If token is invalid (null) or doesn't have id, return empty session (unauthenticated)
      if (!token || !token.id) {
        return null as any;
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled;
        session.user.isVerified = token.isVerified;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
