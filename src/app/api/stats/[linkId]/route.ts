// app/api/stats/[linkId]/route.ts
import dbConnect from "@/lib/mongodb";
import { Link } from "@/app/models/links";
import { LinkStats } from "@/app/models/linkStats";
import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth-helpers";

export async function GET(req: Request, { params }: { params: Promise<{ linkId: string }> }) {
    const { userId } = await getAuth();
    const { linkId } = await params;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const link = await Link.findOne({ _id: linkId, userId });
    if (!link) {
        return NextResponse.json({ error: "Link not found or not yours" }, { status: 403 });
    }

    const stats = await LinkStats.find({ linkId });
    if (stats.length > 0) return NextResponse.json(stats[0]);
    return NextResponse.json({ error: "Not info for this link" })
}
