/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/logger.ts
import { NextRequest } from 'next/server';
import { getClientIp } from './get-client-ip';

type LogLevel = 'info' | 'warn' | 'error' | 'security';

interface LogContext {
  userId?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  [key: string]: any;
}

// ✅ Lista de campos sensibles que NO se deben logear
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'creditCard',
  'ssn',
  'authorization',
];

// ✅ Sanitizar datos antes de logear
function sanitizeData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();

    // Ocultar campos sensibles
    if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// ✅ Logger con contexto y sanitización
class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const sanitizedContext = context ? sanitizeData(context) : {};

    const logEntry = {
      timestamp,
      level,
      message,
      ...sanitizedContext,
    };

    // En producción, enviar a servicio de logging (Sentry, Datadog, etc.)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrar con servicio de logging
      console.log(JSON.stringify(logEntry));
    } else {
      console.log(`[${level.toUpperCase()}]`, message, sanitizedContext);
    }

    // Logs de seguridad van a archivo separado
    if (level === 'security') {
      this.writeSecurityLog(logEntry);
    }
  }

  private writeSecurityLog(entry: any) {
    // TODO: Escribir a base de datos o archivo de seguridad
    console.error('[SECURITY]', JSON.stringify(entry));
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }

  // ✅ Logs especiales para eventos de seguridad
  security(message: string, context?: LogContext) {
    this.log('security', message, context);
  }

  // ✅ Helper para extraer contexto de request
  extractRequestContext(req: NextRequest): LogContext {
    return {
      ip: getClientIp(req),
      userAgent: req.headers.get('user-agent') ?? 'unknown',
      path: req.nextUrl.pathname,
      method: req.method,
    };
  }
}

export const logger = new Logger();

// ✅ Middleware para logear requests
export async function logRequest(
  req: NextRequest,
  userId?: string,
  additionalContext?: Record<string, any>
) {
  const context = {
    ...logger.extractRequestContext(req),
    userId,
    ...additionalContext,
  };

  logger.info('API Request', context);
}

// ✅ Eventos de seguridad a logear
export const SecurityEvents = {
  UNAUTHORIZED_ACCESS: 'unauthorized_access_attempt',
  INVALID_TOKEN: 'invalid_token_used',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity_detected',
  WEBHOOK_VERIFICATION_FAILED: 'webhook_verification_failed',
  INJECTION_ATTEMPT: 'sql_nosql_injection_attempt',
  INVALID_FILE_UPLOAD: 'invalid_file_upload_attempt',
  PREMIUM_BYPASS_ATTEMPT: 'premium_feature_bypass_attempt',
} as const;

// EJEMPLOS DE USO:
//
// // Log normal
// logger.info('User registered successfully', { userId, email });
//
// // Log de error
// logger.error('Database connection failed', { error: err.message });
//
// // Log de seguridad
// logger.security(SecurityEvents.UNAUTHORIZED_ACCESS, {
//     userId: attemptedUserId,
//     resourceId: linkId,
//     ip: req.ip
// });
//
// // Log de request
// await logRequest(req, session?.user?.id);
