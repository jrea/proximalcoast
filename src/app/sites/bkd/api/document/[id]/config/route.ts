
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const config = await req.json();

    const doc = await prisma.bkd_document.update({
      where: { id },
      data: { config },
    });

    return NextResponse.json(doc);
  } catch (error) {
    console.error("Error saving config:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
