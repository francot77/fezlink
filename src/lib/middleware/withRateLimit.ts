/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import rateLimit from '@/lib/rate-limit';

export function withRateLimit(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>,
  options: { limit: number; interval: number }
) {
  const limiter = rateLimit({
    interval: options.interval,
    uniqueTokenPerInterval: 500,
  });

  return async (req: NextRequest, ...args: any[]) => {
    try {
      await limiter.check(req, options.limit);
      return handler(req, ...args);
    } catch {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(options.interval / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(options.interval / 1000)),
          },
        }
      );
    }
  };
}
