import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Link } from '@/app/models/links';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    const { id } = params;
    await Link.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
}
