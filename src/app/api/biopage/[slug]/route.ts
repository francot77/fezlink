import Biopage from "@/app/models/bioPages";
import dbConnect from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: Promise<{ slug?: string }> }) {
    const { slug } = await context.params


    await dbConnect();
    const biopage = await Biopage.findOne({ slug });

    if (!biopage) return NextResponse.json({ message: 'No biopage found' }, { status: 404 });
    return NextResponse.json({ biopage });
}