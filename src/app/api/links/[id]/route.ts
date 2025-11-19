import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Link } from '@/app/models/links';
import Biopage from '@/app/models/bioPages';
import { auth } from '@clerk/nextjs/server';

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await context.params;
    const { userId } = await auth()
    const link = await Link.findById(id)
    if (!link) {
        return NextResponse.json({ success: false, message: 'Link no encontrado' }, { status: 404 });
    }
    if (link.userId !== userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    await Biopage.findOneAndUpdate(
        { userId: link.userId },
        { $pull: { links: { shortId: link.slug } } }
    );
    await Link.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
}
