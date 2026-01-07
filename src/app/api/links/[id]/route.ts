import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { deleteLinkForUser } from '@/core/links/service';

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireAuth();
    const { id } = await context.params;

    const result = await deleteLinkForUser(userId, id);
    if (!result.ok && result.reason === 'not_found') {
      return NextResponse.json({ success: false, message: 'Link not found' }, { status: 404 });
    }
    if (!result.ok && result.reason === 'unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
