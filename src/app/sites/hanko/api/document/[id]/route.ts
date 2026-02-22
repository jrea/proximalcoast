import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await prisma.hanko_document.findUnique({
      where: { id },
      include: {
        signEvents: { orderBy: { sequenceNum: "asc" } },
        consentRecord: true,
      },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error("[Hanko] Document GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
