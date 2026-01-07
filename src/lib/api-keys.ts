import { randomBytes, createHash } from 'crypto';

/**
 * Genera una nueva API Key.
 * Formato: fez_{random_hex_32}
 */
export function generateApiKey(): string {
  const prefix = 'fez';
  const buffer = randomBytes(32);
  return `${prefix}_${buffer.toString('hex')}`;
}

/**
 * Hashea una API Key para almacenamiento seguro.
 * Usamos SHA-256 para rapidez y seguridad suficiente para keys de alta entropía.
 */
export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Verifica si una API Key coincide con el hash almacenado.
 */
export function verifyApiKey(apiKey: string, storedHash: string): boolean {
  const hash = hashApiKey(apiKey);
  return hash === storedHash;
}

/**
 * Enmascara una API Key para mostrarla en la UI.
 * Ejemplo: fez_...a1b2
 */
export function maskApiKey(apiKey: string): string {
  const prefix = apiKey.split('_')[0];
  const suffix = apiKey.slice(-4);
  return `${prefix}_...${suffix}`;
}
