
import { NextRequest, NextResponse } from "next/server";
import { s3 } from "@/lib/s3";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doc = await prisma.bkd_document.findUnique({ where: { id } });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const url = await s3.getSignedUrl(doc.s3Key);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error getting signed URL:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
