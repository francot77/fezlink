import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';
import { LRUCache } from 'lru-cache';

type Options = {
  interval: number;
  uniqueTokenPerInterval: number;
};

// Intenta inicializar Redis si las variables de entorno existen
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

export default function rateLimit(options: Options) {
  // Fallback a LRU Cache si Redis no está configurado
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: async (req: NextRequest, limit: number): Promise<void> => {
      // ✅ Obtener IP del cliente correctamente
      const forwardedFor = req.headers.get('x-forwarded-for');
      const realIp = req.headers.get('x-real-ip');

      // La IP puede venir en x-forwarded-for como "client, proxy1, proxy2"
      // Tomamos solo la primera
      const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || 'unknown';

      // Si Redis está disponible, usarlo
      if (redis) {
        const key = `rate_limit:${ip}`;
        const currentUsage = await redis.incr(key);

        if (currentUsage === 1) {
          // Primer request, establecer expiración
          await redis.expire(key, Math.ceil(options.interval / 1000));
        }

        if (currentUsage > limit) {
          throw new Error('Rate limit exceeded');
        }
        return;
      }

      // Si no, usar LRU Cache (Memoria)
      return new Promise((resolve, reject) => {
        const tokenCount = (tokenCache.get(ip) as number[]) || [0];

        if (tokenCount[0] === 0) {
          tokenCache.set(ip, [1]);
          resolve();
        } else if (tokenCount[0] < limit) {
          tokenCache.set(ip, [tokenCount[0] + 1]);
          resolve();
        } else {
          reject(new Error('Rate limit exceeded'));
        }
      });
    },
  };
}
