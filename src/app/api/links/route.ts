// app/api/links/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Link } from '@/app/models/links';
import { auth } from '@clerk/nextjs/server';

interface PostRequestBody {
    originalUrl: string;
}

interface LinkResponse {
    id: string;
    originalUrl: string;
    shortUrl: string;
    clicks: number;
}

export async function POST(req: Request): Promise<NextResponse<LinkResponse>> {
    const { userId } = await auth()
    await dbConnect();
    const { originalUrl }: PostRequestBody = await req.json();

    const shortId: string = Math.random().toString(36).substring(2, 8); // Simple shortId (mejorar en producción)

    const newLink = await Link.create({ originalUrl, shortId, userId });

    return NextResponse.json({
        id: newLink._id.toString(),
        originalUrl: newLink.originalUrl,
        shortUrl: `${process.env.BASE_URL}/${newLink.shortId}`,
        clicks: newLink.totalClicks
    });
}

export async function GET() {
    const { userId } = await auth()
    await dbConnect();
    const links = await Link.find({ userId });
    const response = links.map(link => ({
        id: link._id,
        originalUrl: link.originalUrl,
        shortUrl: `${process.env.BASE_URL}/${link.shortId}`,
        clicks: link.totalClicks
    }));

    return NextResponse.json({ links: response });

}
