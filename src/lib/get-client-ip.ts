// src/lib/get-client-ip.ts
import { NextRequest } from 'next/server';

/**
 * Obtiene la IP real del cliente desde los headers del request.
 * Soporta múltiples formatos de proxy (x-forwarded-for, x-real-ip, etc.)
 *
 * @param req - NextRequest object
 * @returns IP address del cliente o 'unknown' si no se puede determinar
 */
export function getClientIp(req: NextRequest): string {
  // Header x-forwarded-for puede contener múltiples IPs: "client, proxy1, proxy2"
  // La primera IP es la del cliente real
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }

  // Cloudflare usa CF-Connecting-IP
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;

  // Algunos proxies usan X-Real-IP
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;

  // Header alternativo usado por algunos load balancers
  const trueClientIp = req.headers.get('true-client-ip');
  if (trueClientIp) return trueClientIp;

  // Si estamos detrás de un proxy de Vercel
  const vercelForwardedFor = req.headers.get('x-vercel-forwarded-for');
  if (vercelForwardedFor) {
    const ips = vercelForwardedFor.split(',').map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }

  // Fallback
  return 'unknown';
}

/**
 * Valida si una IP es válida (IPv4 o IPv6)
 */
export function isValidIp(ip: string): boolean {
  if (ip === 'unknown') return false;

  // Regex simple para IPv4
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;

  // Regex simple para IPv6
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Obtiene información adicional del request útil para logging/debugging
 */
export function getRequestMetadata(req: NextRequest) {
  return {
    ip: getClientIp(req),
    userAgent: req.headers.get('user-agent') ?? 'unknown',
    referer: req.headers.get('referer') ?? 'direct',
    origin: req.headers.get('origin') ?? 'unknown',
    method: req.method,
    path: req.nextUrl.pathname,
    searchParams: Object.fromEntries(req.nextUrl.searchParams),
  };
}
