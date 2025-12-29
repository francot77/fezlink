import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Link } from '@/app/models/links';
import Biopage from '@/app/models/bioPages';
import { requireAuth } from '@/lib/auth-helpers';

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await requireAuth();
        const { id } = await context.params;

        await dbConnect();

        const link = await Link.findById(id);

        if (!link) {
            return NextResponse.json({ success: false, message: 'Link not found' }, { status: 404 });
        }

        if (link.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Remove from biopage
        await Biopage.findOneAndUpdate(
            { userId: link.userId },
            { $pull: { links: { shortId: link.slug } } }
        );

        await Link.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}