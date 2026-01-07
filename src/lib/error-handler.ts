/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/error-handler.ts
import { NextResponse } from 'next/server';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ✅ Errores seguros sin filtrar información sensible
export function handleError(error: unknown): NextResponse {
  console.error('[API Error]', error);

  // Error controlado de la aplicación
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }

  // Error de validación de Zod
  if (error && typeof error === 'object' && 'issues' in error) {
    return NextResponse.json(
      { error: 'Validation error', details: (error as any).issues },
      { status: 400 }
    );
  }

  // Errores de MongoDB
  if (error && typeof error === 'object' && 'code' in error) {
    const mongoError = error as any;

    // Duplicate key error
    if (mongoError.code === 11000) {
      const field = Object.keys(mongoError.keyPattern || {})[0];
      return NextResponse.json({ error: `${field || 'Field'} already exists` }, { status: 409 });
    }
  }

  // ❌ NO filtrar detalles del error en producción
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  // En desarrollo, mostrar más detalles
  return NextResponse.json(
    {
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    },
    { status: 500 }
  );
}

// ✅ Wrapper para routes con manejo de errores
export function withErrorHandler<T extends any[]>(handler: (...args: T) => Promise<NextResponse>) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error);
    }
  };
}

// EJEMPLO DE USO:
//
// export const GET = withErrorHandler(async (req: NextRequest) => {
//     const { userId } = await requireAuth();
//
//     if (!someCondition) {
//         throw new AppError(400, 'Invalid request');
//     }
//
//     // ... resto del código
//     return NextResponse.json({ data });
// });
