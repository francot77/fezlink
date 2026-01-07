import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Biopage from '@/app/models/bioPages';
import { isPremiumActive, requireAuth } from '@/lib/auth-helpers';

export async function PUT(req: Request) {
  try {
    const { userId, session } = await requireAuth();
    const body = await req.json();

    const {
      links,
      backgroundColor, // base / legacy
      backgroundImage, // premium
      backgroundBlur, // premium
      backgroundZoom,
      textColor,
      avatarUrl,
      description,
      backgroundPosition,
    } = body;

    await dbConnect();
    const isPremium = isPremiumActive(session);

    // 🔹 Separar set y unset (CLAVE)
    const updateSet: Record<string, unknown> = {
      links,
      textColor,
      avatarUrl,
      description,
    };

    const updateUnset: Record<string, unknown> = {};

    /* ---------- Background base (color / gradient) ---------- */
    if (typeof backgroundColor === 'string') {
      if (!isPremium && backgroundColor.includes('gradient')) {
        // ⚠️ usuario free intenta setear gradient → se ignora
      } else {
        updateSet['background.base'] = backgroundColor;
      }
    }

    /* ---------- Background image (premium gated) ---------- */
    if (typeof backgroundImage === 'string') {
      if (!backgroundImage) {
        // ✅ borrar imagen SIEMPRE permitido
        updateUnset['background.image'] = '';
      } else if (isPremium) {
        // ✅ premium puede setear imagen
        updateSet['background.image'] = {
          url: backgroundImage,
          blur: typeof backgroundBlur === 'number' ? backgroundBlur : 16,
          positionX: backgroundPosition.x,
          positionY: backgroundPosition.y,
          zoom: backgroundZoom,
        };
      } else updateUnset['background.image'] = '';
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
      return NextResponse.json({ error: 'Biopage not found' }, { status: 404 });
    }

    return NextResponse.json({ biopage: updated });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
