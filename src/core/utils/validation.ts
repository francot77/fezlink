/* eslint-disable @typescript-eslint/no-explicit-any */
// src/core/utils/validation.ts
import { z } from 'zod';
import validator from 'validator';
import mongoose from 'mongoose';

type FieldErrors = Record<string, { errors: string[] }>;

function formatZodErrors(error: z.ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path.join('.') || 'root';

    if (!fieldErrors[field]) {
      fieldErrors[field] = { errors: [] };
    }

    fieldErrors[field].errors.push(issue.message);
  }

  return fieldErrors;
}
// ✅ Validación de ObjectId de MongoDB
export function isValidObjectId(id: unknown): boolean {
  if (typeof id !== 'string') return false;
  return mongoose.Types.ObjectId.isValid(id);
}

// ✅ Validación y sanitización de URL
export function validateUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null;

  // Sanitizar y validar
  const sanitized = validator.trim(url);

  if (
    !validator.isURL(sanitized, {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
    })
  ) {
    return null;
  }

  // Bloquear URLs potencialmente peligrosas
  const forbidden = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lower = sanitized.toLowerCase();
  if (forbidden.some((proto) => lower.includes(proto))) {
    return null;
  }

  return sanitized;
}

// ✅ Validación de username
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, hyphens and underscores'
  )
  .transform((val) => val.toLowerCase());

// ✅ Validación de email
export const emailSchema = z
  .email('Invalid email address')
  .transform((val) => val.toLowerCase().trim());

// ✅ Validación de password
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// ✅ Validación de slug
export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(30, 'Slug must be at most 30 characters')
  .regex(/^[a-zA-Z0-9-]+$/, 'Slug can only contain letters, numbers and hyphens')
  .transform((val) => val.toLowerCase());

// ✅ Schema de registro
export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
});

// ✅ Schema de creación de link
export const createLinkSchema = z.object({
  destinationUrl: z.string().refine(validateUrl, 'Invalid URL'),
});

// ✅ Sanitizar objetos para prevenir NoSQL injection
export function sanitizeQuery(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Eliminar operadores de MongoDB
    if (key.startsWith('$')) continue;

    if (typeof value === 'string') {
      sanitized[key] = validator.escape(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeQuery(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// ✅ Wrapper para validar request body
export async function validateRequestBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string | FieldErrors }> {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log(formatZodErrors(error));
      return {
        success: false,
        error: formatZodErrors(error),
      };
    }
    return {
      success: false,
      error: 'Invalid request body',
    };
  }
}

// ✅ Validar parámetros de query
export function validateQueryParams(
  searchParams: URLSearchParams,
  schema: Record<string, 'string' | 'number' | 'boolean'>
): Record<string, any> {
  const validated: Record<string, any> = {};

  for (const [key, type] of Object.entries(schema)) {
    const value = searchParams.get(key);

    if (value === null) continue;

    switch (type) {
      case 'number':
        const num = Number(value);
        if (!isNaN(num)) validated[key] = num;
        break;
      case 'boolean':
        validated[key] = value === 'true';
        break;
      case 'string':
        validated[key] = validator.escape(value);
        break;
    }
  }

  return validated;
}

// EJEMPLO DE USO:
//
// import { validateRequestBody, registerSchema } from '@/core/utils/validation';
//
// export async function POST(req: Request) {
//     const result = await validateRequestBody(req, registerSchema);
//
//     if (!result.success) {
//         return NextResponse.json({ error: result.error }, { status: 400 });
//     }
//
//     const { email, username, password } = result.data;
//     // ... resto del código
// }
