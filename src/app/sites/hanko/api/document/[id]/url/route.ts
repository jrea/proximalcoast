import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { s3 } from "@/lib/s3";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await prisma.hanko_document.findUnique({ where: { id } });

    if (!doc) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    // If sealed, serve the sealed PDF; otherwise the original
    const key = doc.status === "SEALED" ? `hanko/signed/${doc.id}.pdf` : doc.s3Key;
    const url = await s3.getSignedUrl(key, 3600);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[Hanko] Document URL error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
