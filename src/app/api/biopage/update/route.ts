import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Biopage from '@/app/models/bioPages';
import { isPremiumActive, requireAuth } from '@/lib/auth-helpers';
import { withErrorHandler, AppError } from '@/lib/error-handler';
import { updateBiopageSchema, validateRequestBody } from '@/core/utils/validation';

async function updateBiopageHandler(req: Request) {
  const { userId, session } = await requireAuth();

  // 1. Validar request body con Zod
  const validation = await validateRequestBody(req, updateBiopageSchema);

  if (!validation.success) {
    // validation.error es un objeto FieldErrors o string, lo pasamos al cliente
    // pero AppError espera string message.
    // Podemos devolver la respuesta JSON directamente aquí o mejorar AppError.
    // Por simplicidad y consistencia, usaremos el mensaje del primer error si es posible,
    // o devolveremos un 400 con el detalle.
    // Como validateRequestBody devuelve un objeto estructurado en error, es mejor retornarlo directamente.
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const {
    links,
    backgroundColor,
    backgroundImage,
    backgroundBlur,
    backgroundZoom,
    textColor,
    avatarUrl,
    description,
    backgroundPosition,
  } = validation.data;

  await dbConnect();
  const isPremium = isPremiumActive(session);

  // 2. Separar set y unset
  const updateSet: Record<string, unknown> = {};

  if (links) updateSet.links = links;
  if (textColor) updateSet.textColor = textColor;
  if (avatarUrl !== undefined) updateSet.avatarUrl = avatarUrl;
  if (description !== undefined) updateSet.description = description;

  const updateUnset: Record<string, unknown> = {};

  /* ---------- Background base (color / gradient) ---------- */
  if (backgroundColor) {
    if (!isPremium && backgroundColor.includes('gradient')) {
      // Usuario free intenta setear gradient -> ignorar
    } else {
      updateSet['background.base'] = backgroundColor;
    }
  }

  /* ---------- Background image (premium gated) ---------- */
  if (backgroundImage !== undefined) {
    if (!backgroundImage) {
      // ✅ borrar imagen SIEMPRE permitido
      updateUnset['background.image'] = '';
    } else if (isPremium) {
      // ✅ premium puede setear imagen
      updateSet['background.image'] = {
        url: backgroundImage,
        blur: backgroundBlur ?? 16,
        positionX: backgroundPosition?.x ?? 0,
        positionY: backgroundPosition?.y ?? 0,
        zoom: backgroundZoom ?? 1,
      };
    } else {
      updateUnset['background.image'] = '';
    }
  }

  /* ---------- Ejecutar update ---------- */
  const updated = await Biopage.findOneAndUpdate(
    { userId },
    {
      ...(Object.keys(updateSet).length && { $set: updateSet }),
      ...(Object.keys(updateUnset).length && { $unset: updateUnset }),
    },
    { new: true }
  );

  if (!updated) {
    throw new AppError(404, 'Biopage not found');
  }

  return NextResponse.json({ biopage: updated });
}

export const PUT = withErrorHandler(updateBiopageHandler);
