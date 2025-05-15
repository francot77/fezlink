// app/api/links/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Link } from '@/app/models/links';

interface DeleteRequestParams {
    params: {
        id: string;
    };
}

export async function DELETE(req: Request, { params }: DeleteRequestParams) {
    await dbConnect();
    const { id } = params;
    await Link.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
}
