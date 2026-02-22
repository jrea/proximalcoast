import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const config = await req.json();

    const doc = await prisma.hanko_document.findUnique({ where: { id } });
    if (!doc) return NextResponse.json({ error: "Document not found." }, { status: 404 });
    if (doc.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.hanko_document.update({
      where: { id },
      data: { config },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Hanko] Config save error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
