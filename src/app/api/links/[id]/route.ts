import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Link } from '@/app/models/links';

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await context.params;
    await Link.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
}
